import express from "express";
import {
  getAllCourses,
  getQueryCourses,
  likeCourse,
  getSingleCourse,
  createReview,
  likeReview,
  updateUserCourseNum,
  getTableViewCourses,
  addTableViewCourse,
  deleteTableViewCourse,
  deleteAllTableViewCourse,
} from "../controllers/courseController";

const courseRouter = express.Router();

courseRouter.route("/").get(getQueryCourses).patch(likeCourse);
courseRouter.route("/all").get(getAllCourses);
courseRouter.route("/tableView/:tableName").get(getTableViewCourses);
courseRouter.route("/updateUserCourseNum").patch(updateUserCourseNum);
courseRouter.route("/:id").get(getSingleCourse).post(createReview);
courseRouter.route("/review/:reviewId").patch(likeReview);
courseRouter.route("/patchTVCourse").patch(addTableViewCourse);
courseRouter.route("/deleteTVCourse").patch(deleteTableViewCourse);
courseRouter.route("/deleteAllTVCourse").patch(deleteAllTableViewCourse);

export default courseRouter;
