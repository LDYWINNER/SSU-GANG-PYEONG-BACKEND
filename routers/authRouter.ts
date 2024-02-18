import express from "express";

const authRouter = express.Router();

import { register, login, updateUser } from "../controllers/authController";

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/updateUser").patch(updateUser);

export default authRouter;
