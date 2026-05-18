import { DataTypes } from "sequelize";
import sequelize from "../connection.db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Name is required",
        },
        notEmpty: {
          msg: "Name cannot be empty",
        },
        len: {
          args: [3, 100],
          msg: "Name must be more than 2 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: "Email already exists",
      },
      validate: {
        notNull: {
          msg: "Email is required",
        },
        notEmpty: {
          msg: "Email cannot be empty",
        },
        isEmail: {
          msg: "Please provide a valid email address",
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required",
        },
        notEmpty: {
          msg: "Password cannot be empty",
        },
        len: {
          args: [7, 255],
          msg: "Password must be more than 6 characters",
        },
      },
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: true,
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
