import { Model, Schema, model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  school: string;
  major: string;
  courseReviewNum: number;
  adminAccount: boolean;
}

export interface IUserMethods {
  createJWT(): void;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: [true, "Please provide name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
  },
  school: {
    type: String,
    required: [true, "Please provide your school info"],
  },
  major: {
    type: String,
    required: [true, "Please provide your major"],
  },
  courseReviewNum: {
    type: Number,
    required: true,
  },
  adminAccount: {
    type: Boolean,
  },
  // to do list?
  // 듣고 있는 수업 list
});

export default model<IUser, UserModel>("User", UserSchema);
