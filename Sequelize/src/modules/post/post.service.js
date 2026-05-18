import { Post, User, Comment } from "../../DB/model/index.js";

export const getAllPosts = async () => {
  const posts = await Post.findAll({
    include: [
      {
        association: "user",
        attributes: ["id", "name", "email"],
      },
      {
        association: "comments",
      },
    ],
  });
  return posts;
};

export const getPostsWithDetails = async () => {
  const posts = await Post.findAll({
    attributes: ["id", "title"],
    include: [
      {
        association: "user",
        attributes: ["id", "name"],
      },
      {
        association: "comments",
        attributes: ["id", "content"],
      },
    ],
  });
  return posts.map((p) => p.toJSON());
};

export const getPostsWithCommentCount = async () => {
  const posts = await Post.findAll({
    attributes: ["id", "title"],
  });
  const result = await Promise.all(
    posts.map(async (post) => {
      const count = await Comment.count({ where: { postId: post.id } });
      return {
        id: post.id,
        title: post.title,
        commentCount: count,
      };
    })
  );
  return result;
};

export const getPostById = async (id) => {
  const post = await Post.findByPk(id, {
    include: [
      {
        association: "user",
        attributes: ["id", "name", "email"],
      },
      {
        association: "comments",
        include: [
          {
            association: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
  });
  return post;
};

export const createPost = async (postData) => {
  const post = await Post.create(postData);
  return post;
};

export const updatePost = async (id, postData) => {
  const post = await Post.findByPk(id);
  if (!post) {
    return null;
  }
  await post.update(postData);
  return post;
};

export const deletePost = async (id) => {
  const post = await Post.findByPk(id);
  if (!post) {
    return null;
  }
  await post.destroy();
  return true;
};
