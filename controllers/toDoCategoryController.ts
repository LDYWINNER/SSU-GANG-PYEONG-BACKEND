import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ToDoCategory, { IToDoCategory } from "../models/ToDoCategory";

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ToDoCategory.find({});
    return res.send(categories);
  } catch (error) {
    console.log("error in register", error);
    throw error;
  }
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const { color, icon, isEditable, name }: IToDoCategory = req.body;

    const category = await ToDoCategory.create({
      color,
      icon,
      isEditable,
      name,
    });
  } catch (error) {
    console.log("error in register", error);
    throw error;
  }
};

export { getAllCategories, createCategory };
