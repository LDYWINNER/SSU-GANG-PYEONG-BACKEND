import express from "express";

const toDoCategoryRouter = express.Router();

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/toDoCategoryController";

toDoCategoryRouter.route("/").get(getAllCategories);
toDoCategoryRouter.route("/:id").get(getCategoryById);
toDoCategoryRouter.route("/create").post(createCategory);
toDoCategoryRouter.route("/:id").delete(deleteCategory);
toDoCategoryRouter.route("/update").put(updateCategory);

export default toDoCategoryRouter;
