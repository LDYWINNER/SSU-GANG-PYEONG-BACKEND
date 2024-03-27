import express from "express";

const authRouter = express.Router();

import rateLimiter from "express-rate-limit";
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

import {
  register,
  login,
  updateUser,
  registerEmail,
  loginEmail,
  userDeleteEmail,
} from "../controllers/authController";

authRouter.route("/registerEmail").post(apiLimiter, registerEmail);
authRouter.route("/loginEmail").post(apiLimiter, loginEmail);
authRouter.route("/register").post(apiLimiter, register);
authRouter.route("/login").post(apiLimiter, login);
authRouter.route("/updateUser").patch(apiLimiter, updateUser);
authRouter.route("/userDelete/:userId").post(userDeleteEmail);

export default authRouter;
