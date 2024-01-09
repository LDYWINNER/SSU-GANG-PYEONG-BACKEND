import { Schema, model, Model } from "mongoose";

export interface ICourseReview {
  _id: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  semester: string;
  instructor: string;
  myLetterGrade: string;
  homeworkQuantity: string;
  teamProjectPresence: boolean;
  difficulty: string;
  testQuantity: string;
  testType: string;
  quizPresence: boolean;
  overallGrade: number;
  overallEvaluation: string;
  createdBy: Schema.Types.ObjectId;
  createdByUsername: string;
  anonymity: boolean;
  generosity: string;
  attendance: string;
  likes: string[];
}

type CourseReviewModel = Model<ICourseReview>;

const CourseReviewSchema = new Schema<ICourseReview, CourseReviewModel>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    semester: {
      type: String,
      required: [true, "Please provide which semester you took this course"],
    },
    instructor: {
      type: String,
      required: [true, "Please provide the instructor"],
    },
    myLetterGrade: {
      type: String,
    },
    homeworkQuantity: {
      type: String,
      enum: ["many", "soso", "few"],
      required: [true, "Please provide homework quantity"],
    },
    teamProjectPresence: {
      type: Boolean,
      required: [true, "Please provide team project presence"],
    },
    difficulty: {
      type: String,
      enum: ["difficult", "soso", "easy"],
    },
    testQuantity: {
      type: String,
      required: [true, "Please provide test quantity"],
    },
    testType: {
      type: String,
      required: [true, "Please provide test type"],
    },
    quizPresence: {
      type: Boolean,
      required: [true, "Please provide quiz presence"],
    },
    overallGrade: {
      type: Number,
      required: [true, "Please select overall grade of the course"],
    },
    overallEvaluation: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    createdByUsername: {
      type: String,
      required: true,
    },
    anonymity: {
      type: Boolean,
      required: true,
      default: true,
    },
    generosity: {
      type: String,
      required: true,
    },
    attendance: {
      type: String,
      required: true,
    },
    likes: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export default model<ICourseReview, CourseReviewModel>(
  "CourseReview",
  CourseReviewSchema
);
