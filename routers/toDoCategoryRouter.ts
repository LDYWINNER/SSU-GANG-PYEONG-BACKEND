import express from "express";

const toDoCategoryRouter = express.Router();

import {
  getAllCategories,
  createCategory,
} from "../controllers/toDoCategoryController";

toDoCategoryRouter.route("/").get(getAllCategories);
toDoCategoryRouter.route("/create").get(createCategory);

export default toDoCategoryRouter;
