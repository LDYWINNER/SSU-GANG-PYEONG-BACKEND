import { Response } from "express";
import { AuthRequest } from "../middleware/authenticateUser";
import ToDoTask from "../models/ToDoTask";
import { IToDoTask } from "../types";
import ToDoCategory from "../models/ToDoCategory";

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    const tasks = await ToDoTask.find({
      user: userId,
    });
    res.json(tasks);
  } catch (error) {
    console.log("error in getAllTasks", error);
    res.json({ error: "Error while fetching all tasks" });
    throw error;
  }
};

export const getAllTasksByCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const tasks = await ToDoTask.find({
      user: userId,
      categoryId: id,
    });
    res.json(tasks);
  } catch (error) {
    console.log("error in getAllTasksByCategory", error);
    res.json({ error: "Error while fetching all tasks by category" });
    throw error;
  }
};

export const getAllCompletedTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    const tasks = await ToDoTask.find({
      user: userId,
      isCompleted: true,
    });
    res.json(tasks);
  } catch (error) {
    console.log("error in getAllCompletedTasks", error);
    res.json({ error: "Error while fetching all completed tasks" });
    throw error;
  }
};

export const getTasksForToday = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    const todaysISODate = new Date();
    todaysISODate.setHours(-5, 0, 0, 0);
    // console.log(todaysISODate);

    const tasks = await ToDoTask.find({
      user: userId,
      date: todaysISODate.toISOString(),
    });
    res.json(tasks);
  } catch (error) {
    console.log("error in getTasksForToday", error);
    res.json({ error: "Error while fetching tasks for today" });
    throw error;
  }
};

export const getTasksSpecificDay = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    // console.log(userId);
    const { date } = req.params;
    // console.log(date);
    const tasks = await ToDoTask.find({
      user: userId,
      date: date,
    });
    res.json(tasks);
  } catch (error) {
    console.log("error in getTasksSpecificDay", error);
    res.json({ error: "Error while fetching tasks for specific day" });
    throw error;
  }
};

export const getMonthlyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    console.log(userId);
    const { date } = req.params;

    // Parse the date to get the first and last day of the month
    const year = parseInt(date.split("-")[0]);
    const month = parseInt(date.split("-")[1]) - 1; // months are 0-indexed in JavaScript Date

    const firstDayOfMonth = new Date(year, month, 1);
    firstDayOfMonth.setHours(-5, 0, 0, 0);
    const lastDayOfMonth = new Date(year, month + 1, 0); // Setting day as 0 gets the last day of the previous month
    lastDayOfMonth.setHours(-5, 0, 0, 0);

    const tasks = await ToDoTask.find({
      user: userId,
      date: {
        $gte: firstDayOfMonth.toISOString(),
        $lte: lastDayOfMonth.toISOString(),
      },
    });

    console.log(tasks);
    res.json(tasks);
  } catch (error) {
    console.log("error in getTasksSpecificDay", error);
    res.json({ error: "Error while fetching tasks for specific day" });
    throw error;
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    const { name, date, categoryId }: IToDoTask = req.body;

    const category = await ToDoCategory.findOne({
      _id: categoryId,
    });

    const task = await ToDoTask.create({
      name,
      date,
      categoryId,
      categoryTitle:
        category?.name.split(" ")[0] === "AMS" ||
        "ACC" ||
        "BUS" ||
        "CSE" ||
        "ESE" ||
        "EST" ||
        "EMP" ||
        "MEC"
          ? category?.name.split(" ")[0]
          : "Other",
      user: userId,
    });
    res.json(task);
  } catch (error) {
    console.log("error in createTask", error);
    res.json({ error: "Error while creating task" });
    throw error;
  }
};

export const toggleTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { isCompleted } = req.body;
    const { id } = req.params;

    const task = await ToDoTask.updateOne(
      {
        _id: id,
      },
      {
        isCompleted,
      }
    );
    res.json({ message: "Task status updated" });
  } catch (error) {
    console.log("error in toggleTaskStatus", error);
    res.json({ error: "Error while toggling status task" });
    throw error;
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await ToDoTask.deleteOne({
      _id: id,
    });
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.log("error in deleteTask", error);
    res.json({ error: "Error while deleting task" });
    throw error;
  }
};

export const editTask = async (req: AuthRequest, res: Response) => {
  try {
    const { _id, categoryId, date, name }: IToDoTask = req.body;
    await ToDoTask.updateOne(
      {
        _id,
      },
      {
        $set: {
          name,
          categoryId,
          date,
        },
      }
    );
    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.log("error in editTask", error);
    res.json({ error: " Error while updating the task" });
    throw error;
  }
};
