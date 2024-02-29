import express from "express";

const personalScheduleRouter = express.Router();

import {
  createNewPS,
  deletePS,
  updatePS,
} from "../controllers/personalScheduleController";

personalScheduleRouter.route("/create").patch(createNewPS);
personalScheduleRouter.route("/delete").patch(deletePS);
personalScheduleRouter.route("/update").patch(updatePS);

export default personalScheduleRouter;
