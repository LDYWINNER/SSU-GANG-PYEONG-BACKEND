import express from "express";

const tableRouter = express.Router();

import {
  createNewTable,
  deleteTable,
  updateTableName,
} from "../controllers/tableController";

tableRouter.route("/create").patch(createNewTable);
tableRouter.route("/delete").patch(deleteTable);
tableRouter.route("/update").patch(updateTableName);

export default tableRouter;
