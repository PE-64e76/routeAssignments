import User from "./user.model.js";
import Post from "./post.model.js";
import Comment from "./comment.model.js";
import sequelize from "../connection.db.js";




User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


Post.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});


User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});


Post.hasMany(Comment, {
  foreignKey: "postId",
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


Comment.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});


export const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully. ✅");
  } catch (error) {
    console.error("Error synchronizing models ❌", error);
  }
};

export { User, Post, Comment };
