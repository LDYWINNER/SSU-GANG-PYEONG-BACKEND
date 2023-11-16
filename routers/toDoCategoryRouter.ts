import express from "express";

const toDoCategoryRouter = express.Router();

import { getAllCategories } from "../controllers/toDoCategoryController";

toDoCategoryRouter.route("/").get(getAllCategories);

export default toDoCategoryRouter;
