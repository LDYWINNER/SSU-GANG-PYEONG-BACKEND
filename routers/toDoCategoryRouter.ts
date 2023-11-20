import express from "express";

const toDoCategoryRouter = express.Router();

import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/toDoCategoryController";

toDoCategoryRouter.route("/").get(getAllCategories);
toDoCategoryRouter.route("/create").post(createCategory);
toDoCategoryRouter.route("/:id").delete(deleteCategory);
toDoCategoryRouter.route("/update").put(updateCategory);

export default toDoCategoryRouter;
