import { Model, Schema, model } from "mongoose";

export interface IToDoColor {
  name: string;
  id: string;
  code: string;
}

export interface IToDoIcon {
  name: string;
  id: string;
  symbol: string;
}

export interface IToDoCategory {
  name: string;
  isEditable: boolean;
  color: IToDoColor;
  icon: IToDoIcon;
  user: IUser | string;
}

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
