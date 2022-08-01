import { GetStaticProps } from 'next';
import { ChangeEvent, FormEvent, useState } from 'react';
import PortableText from 'react-portable-text';
import { Header } from '../../components';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';

interface Props {
  post: Post;
}

const SinglePost = ({ post }: Props) => {
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: '',
    _id: post._id,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCommentForm({ ...commentForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/create-comment', {
        method: 'POST',
        body: JSON.stringify(commentForm),
      });
      setSubmitted(true);
    } catch (error) {
      console.log(error);
      setSubmitted(false);
    }
  };
  return (
    <main>
      <Header />

      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()}
        alt=""
      />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-300">{post.description}</h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full object-cover my-2"
            src={urlFor(post.author.image).url()}
            alt=""
          />
          <p className="font-extralight text-sm">
            Blog posted by{' '}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="text-xl font-bold my-5" {...props} />
              ),
              normal: (props: any) => <p className="mb-3" {...props} />,
              li: ({ children }: any) => (
                <li className="ml-10 mt-2 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

      {submitted ? (
        <div className="flex flex-col rounded p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-3">
            Thank you for submitting your comment!{' '}
          </h3>
          <p>Once it as approved, it will appear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold ">Leave a comment below!</h4>
          <hr className="py-3 mt-2" />

          <div className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              name="name"
              required
              onChange={handleInputChange}
              className="shadow border rounded py-2 px-3 form-input mt-2 block w-full ring-yellow-500 focus:ring-1 outline-none caret-yellow-400"
              type="text"
              placeholder="John Eric"
            />
          </div>
          <div className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              name="email"
              required
              onChange={handleInputChange}
              className="shadow border rounded py-2 px-3 form-input mt-2 block w-full ring-yellow-500 focus:ring-1 outline-none caret-yellow-400"
              type="email"
              placeholder="eric@gmail.com"
            />
          </div>
          <div className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              name="comment"
              required
              onChange={handleInputChange}
              rows={8}
              className="shadow border rounded py-2 px-3 form-textarea mt-2 block w-full ring-yellow-500 focus:ring-1 outline-none "
              placeholder="Chat something with me..."
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-500 py-2 rounded cursor-pointer text-white shadow hover:bg-yellow-400 transition-all duration-200"
          >
            Submit
          </button>
        </form>
      )}

      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow space-y-2 shadow-yellow-500">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500"> {comment.name}</span> :{' '}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
        _id,
        slug {
            current
        }
      }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));
  console.log({ paths });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
      title,
      slug,
      author -> {
      name, image
     },
  "comments": *[
    _type == "comment" &&
    post._ref == ^._id &&
    approved == true],
    description,
    mainImage,
  body
    
  }`;

  const post = await sanityClient.fetch(query, {
    slug: params!.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 10,
  };
};

export default SinglePost;
