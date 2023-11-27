import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middleware/authenticateUser";
import ToDoCategory from "../models/ToDoCategory";
import ToDoTask from "../models/ToDoTask";
import { IToDoCategory } from "../types/index";

const getAllCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    const categories = await ToDoCategory.find({
      user,
    });
    return res.send(categories);
  } catch (error) {
    console.log("error in getAllCategories", error);
    res.send({ error: "Error in getting all the categories" });
    throw error;
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const category = await ToDoCategory.findOne({
      _id: id,
    });
    return res.send(category);
  } catch (error) {
    res.send({ error: "Something went wrong" });
    console.log("error in getAllCategories", error);
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
    console.log("error in createCategory", error);
    res.send({ error: "Error in creating a category" });
    throw error;
  }
};

const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await ToDoTask.deleteMany({
      categoryId: id,
    });
    const category = await ToDoCategory.deleteOne({
      _id: id,
    });
    res.send({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("error in deleteCategory", error);
    res.send({ error: "Error in deleting the category" });
    throw error;
  }
};

const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { _id, color, icon, isEditable, name }: IToDoCategory = req.body;
    await ToDoCategory.updateOne(
      {
        _id,
      },
      {
        $set: {
          name,
          color,
          icon,
          isEditable,
        },
      }
    );
    res.send({ message: "Category updated successfully" });
  } catch (error) {
    console.log("error in updateCategory", error);
    res.send({ error: "Error in updating the category" });
    throw error;
  }
};

export { getAllCategories, createCategory, deleteCategory, updateCategory };
