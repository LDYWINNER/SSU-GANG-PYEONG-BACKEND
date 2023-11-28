import { Schema, model, Model } from "mongoose";

export interface ICourse {
  classNbr: string;
  subj: string;
  crs: string;
  courseTitle: string;
  sbc: string;
  cmp: string;
  sctn: string;
  credits: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  instructor: [string];
  instructor_names: string;
  likes: [string];
  reviews: [Schema.Types.ObjectId];
  semesters: [string];
}

type CourseModel = Model<ICourse>;

const CourseSchema = new Schema<ICourse, CourseModel>({
  classNbr: {
    type: String,
    required: true,
  },
  subj: {
    type: String,
    required: true,
  },
  crs: {
    type: String,
    requred: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  sbc: {
    type: String,
    requred: true,
  },
  cmp: {
    type: String,
    requred: true,
  },
  sctn: {
    type: String,
    requred: true,
  },
  credits: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  instructor: {
    type: [String],
    required: true,
  },
  instructor_names: {
    type: String,
    required: true,
  },
  likes: {
    type: [String],
    required: true,
    default: [],
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "CourseReview",
    },
  ],
  semesters: {
    type: [String],
    required: true,
  },
});

export default model<ICourse, CourseModel>("Course", CourseSchema);
