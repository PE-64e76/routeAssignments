import { DataTypes, Model } from "sequelize";
import sequelize from "../connection.db.js";

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Title is required",
        },
        notEmpty: {
          msg: "Title cannot be empty",
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Content is required",
        },
        notEmpty: {
          msg: "Content cannot be empty",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
    paranoid: true,
  }
);

export default Post;
