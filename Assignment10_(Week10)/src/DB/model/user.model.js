import mongoose from "mongoose";
import { genderEnum, providerEnum } from "../../common/enums/user.enum.js";

const userSchema = new mongoose.Schema({
    firstName: {
      type:String,
      required: [true, "First name is required"],
      minLength: 2,
      maxLength: 25
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minLength: 2,
      maxLength: 25
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    gender: {
        type:String,
        enum: Object.values(genderEnum),
        default: genderEnum.Male
    },
    provider:{
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.System
    },
    confirmEmail: Date,
    DOB: Date,
    phone:String,
    profilePic:String,
    otp: String,
    otpExpires: Date
  },

  {
    collection: "Saraha_Users",
    timestamps:true,
    strict:true,
    strictQuery:true
  },
);
userSchema.virtual("username").set(function(value){
    const [firstName, lastName] = value?.split(' ') || [];
    this.set({firstName, lastName})
}).get(function(){
    return this.firstName + ' ' + this.lastName
})

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)
