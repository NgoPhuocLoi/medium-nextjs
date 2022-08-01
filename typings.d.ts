export interface Post {
  _id: string;
  _createdAt: string;
  title: string;
  description: string;
  author: {
    name: string;
    image: string;
  };
  mainImage: {
    asset: {
      url: string;
    };
  };
  slug: {
    current: string;
  };
  body: [object];
  comments: Comment[];
}

export interface Comment {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: comment;
  _updatedAt: string;
  approved: boolean;
  comment: string;
  email: string;
  name: string;
  post: {
    _ref: string;
    _type: string;
  };
}
