import express from "express";
import {
  createTask,
  deleteTask,
  editTask,
  getAllCompletedTasks,
  getAllTasks,
  getAllTasksByCategory,
  getTasksForToday,
  getTasksSpecificDay,
  toggleTaskStatus,
} from "../controllers/toDoTaskController";

const toDoTaskRouter = express.Router();

toDoTaskRouter.route("/").get(getAllTasks);
toDoTaskRouter.route("/tasks-by-categories/:id").get(getAllTasksByCategory);
toDoTaskRouter.route("/completed").get(getAllCompletedTasks);
toDoTaskRouter.route("/today").get(getTasksForToday);
toDoTaskRouter.route("/:date").get(getTasksSpecificDay);
toDoTaskRouter.route("/create").post(createTask);
toDoTaskRouter.route("/update/:id").put(toggleTaskStatus);
toDoTaskRouter.route("/:id").delete(deleteTask);
toDoTaskRouter.route("/edit/:id").put(editTask);

export default toDoTaskRouter;
