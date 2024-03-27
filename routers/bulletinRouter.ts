import express from "express";
import {
  createBulletinPost,
  updateBulletinPost,
  deleteBulletinPost,
  getAllBulletinPosts,
  getSinglePost,
  likeBulletinPost,
  createComment,
  likeComment,
  deleteComment,
  reportPostEmail,
  reportCommentEmail,
} from "../controllers/bulletinController";

const bulletinRouter = express.Router();

bulletinRouter
  .route("/")
  .post(createBulletinPost)
  .get(getAllBulletinPosts)
  .patch(likeBulletinPost);
bulletinRouter.route("/update").put(updateBulletinPost);
bulletinRouter
  .route("/:id")
  .delete(deleteBulletinPost)
  .get(getSinglePost)
  .post(createComment);
bulletinRouter
  .route("/comment/:commentId")
  .patch(likeComment)
  .delete(deleteComment);
bulletinRouter.route("/report-post/:id").post(reportPostEmail);
bulletinRouter.route("/report-comment/:id").post(reportCommentEmail);

export default bulletinRouter;
