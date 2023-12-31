import express from "express";
import {
  createBulletinPost,
  deleteBulletinPost,
  getAllBulletinPosts,
  getSinglePost,
  likeBulletinPost,
  createComment,
  likeComment,
  deleteComment,
} from "../controllers/bulletinController";

const bulletinRouter = express.Router();

bulletinRouter
  .route("/")
  .post(createBulletinPost)
  .get(getAllBulletinPosts)
  .patch(likeBulletinPost);
bulletinRouter
  .route("/:id")
  .delete(deleteBulletinPost)
  .get(getSinglePost)
  .post(createComment);
bulletinRouter
  .route("/comment/:commentId")
  .patch(likeComment)
  .delete(deleteComment);

export default bulletinRouter;
