import { Model, Schema, model } from "mongoose";
import { IToDoCategory } from "../types/index";

export interface IToDoCategoryMethods {}

type ToDoCategoryModel = Model<IToDoCategory, {}, IToDoCategoryMethods>;

const ToDoCategorySchema = new Schema<
  IToDoCategory,
  ToDoCategoryModel,
  IToDoCategoryMethods
>({
  name: {
    type: String,
    required: true,
  },
  isEditable: {
    type: Boolean,
    required: false,
    default: true,
  },
  color: {
    id: String,
    name: String,
    code: String,
  },
  icon: {
    id: String,
    name: String,
    symbol: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model<IToDoCategory, ToDoCategoryModel>(
  "ToDoCategory",
  ToDoCategorySchema
);
