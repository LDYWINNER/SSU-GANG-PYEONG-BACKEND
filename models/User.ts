import { Model, Schema, model } from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  school: string;
  major: string;
  courseReviewNum: number;
  adminAccount: boolean;
  classHistory: {
    [index: string]: [string];
  };
  personalSchedule: [
    {
      id: string;
      courseId: string;
      sections: {
        LEC: any;
      };
    }
  ];
}

export interface IUserMethods {}

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
  classHistory: {
    type: Object,
  },
  personalSchedule: {
    type: [Object],
  },
});

export default model<IUser, UserModel>("User", UserSchema);
