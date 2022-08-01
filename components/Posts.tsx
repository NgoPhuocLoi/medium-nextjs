import Link from 'next/link';
import React from 'react';
import { sanityClient, urlFor } from '../sanity';
import { Post } from '../typings';

interface Props {
  posts: Post[];
}

const Posts = ({ posts }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6">
      {posts.map((post) => (
        <Link href={`/post/${post.slug.current}`} key={post._id}>
          <div className="group shadow overflow-hidden cursor-pointer rounded-lg ">
            <img
              className="w-full h-60 object-cover rounded group-hover:scale-105 transition-transform duration-200 ease-in-out"
              src={urlFor(post.mainImage).url()}
              alt=""
            />
            <div className="flex justify-between p-5 bg-white">
              <div>
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="text-sm">
                  {post.description} by {post.author.name}
                </p>
              </div>

              <img
                className="h-12 w-12 rounded-full object-cover "
                src={urlFor(post.author.image).url()}
                alt=""
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Posts;
