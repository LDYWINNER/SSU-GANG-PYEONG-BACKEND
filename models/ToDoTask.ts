import mongoose, { Schema } from "mongoose";

const toDoTaskSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ToDoCategory",
    },
    categoryTitle: {
      // Subj meaning AMS, ACC, ...
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    categoryColor: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ToDoTask = mongoose.model("ToDoTask", toDoTaskSchema);

export default ToDoTask;
