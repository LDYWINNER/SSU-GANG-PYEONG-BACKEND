import { Schema, model, Model } from "mongoose";

export interface ICourse {
  _id: string;
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
  instructor_names: string; // 이 과목을 가르쳤던 교수들
  likes: [string];
  reviews: Schema.Types.ObjectId[];
  semesters: [string];
  avgGrade: number;
  unique_instructor: string; // 표시할 때 사용할 제일 최근 학기 교수
}

type CourseModel = Model<ICourse>;

const CourseSchema = new Schema<ICourse, CourseModel>({
  avgGrade: {
    type: Number,
  },
  classNbr: {
    type: String,
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
  unique_instructor: {
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
