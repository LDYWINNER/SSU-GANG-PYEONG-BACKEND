import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middleware/authenticateUser";
import ToDoCategory from "../models/ToDoCategory";
import { IToDoCategory } from "../types/index";

const getAllCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    const categories = await ToDoCategory.find({
      user,
    });
    return res.send(categories);
  } catch (error) {
    console.log("error in register", error);
    res.send({ error: "Something went wrong" });
    throw error;
  }
};

const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { color, icon, isEditable, name }: IToDoCategory = req.body;
    const { user } = req;

    const category = await ToDoCategory.create({
      color,
      icon,
      isEditable,
      name,
      user,
    });

    res.send(category);
  } catch (error) {
    console.log("error in register", error);
    res.send({ error: "Something went wrong" });
    throw error;
  }
};

export { getAllCategories, createCategory };
