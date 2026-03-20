import { Op } from "sequelize";
import { Comment, User, Post } from "../../DB/model/index.js";

export const getAllComments = async () => {
  const comments = await Comment.findAll({
    include: [
      {
        association: "user",
        attributes: ["id", "name", "email"],
      },
      {
        association: "post",
        attributes: ["id", "title"],
      },
    ],
  });
  return comments;
};

export const getCommentById = async (id) => {
  const comment = await Comment.findByPk(id, {
    include: [
      {
        association: "user",
        attributes: ["id", "name", "email"],
      },
      {
        association: "post",
        attributes: ["id", "title", "content"],
      },
    ],
  });
  return comment;
};

export const getCommentDetailsById = async (id) => {
  const comment = await Comment.findByPk(id, {
    attributes: ["id", "content"],
    include: [
      { association: "user", attributes: ["id", "name", "email"] },
      { association: "post", attributes: ["id", "title", "content"] },
    ],
  });
  return comment ? comment.toJSON() : null;
};

export const getCommentsByPostId = async (postId) => {
  const comments = await Comment.findAll({
    where: { postId },
    include: [
      {
        association: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });
  return comments;
};

export const getNewestCommentsByPostId = async (postId) => {
  const comments = await Comment.findAll({
    where: { postId },
    attributes: ["id", "content", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: 3,
  });
  return comments.map((c) => c.toJSON());
};

export const searchCommentsByWord = async (word) => {
  if (!word) return null;
  const comments = await Comment.findAll({
    where: { content: { [Op.like]: `%${word}%` } },
    attributes: ["id", "content", "postId", "userId", "createdAt", "updatedAt"],
  });
  if (comments.length === 0) return null;
  return {
    count: comments.length,
    comments: comments.map((c) => c.toJSON()),
  };
};

export const getCommentsByUserId = async (userId) => {
  const comments = await Comment.findAll({
    where: { userId },
    include: [
      {
        association: "post",
        attributes: ["id", "title"],
      },
    ],
  });
  return comments;
};

export const createComment = async (commentData) => {
  const comment = await Comment.create(commentData);
  return comment;
};

export const findOrCreateComment = async ({ postId, userId, content }) => {
  const [comment, created] = await Comment.findOrCreate({
    where: { postId, userId, content },
    defaults: { postId, userId, content },
  });
  return { comment: comment.toJSON(), created };
};

export const createBulkComments = async (data) => {
  const comments = Array.isArray(data) ? data : data?.comments ?? [];
  await Comment.bulkCreate(comments);
};

export const updateComment = async (id, commentData) => {
  const comment = await Comment.findByPk(id);
  if (!comment) {
    return null;
  }
  await comment.update(commentData);
  return comment;
};

export const updateCommentByOwner = async (commentId, { userId, content }) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) return { status: "not_found" };
  if (comment.userId !== parseInt(userId)) return { status: "not_authorized" };
  await comment.update({ content });
  return { status: "ok" };
};

export const deleteComment = async (id) => {
  const comment = await Comment.findByPk(id);
  if (!comment) {
    return null;
  }
  await comment.destroy();
  return true;
};
