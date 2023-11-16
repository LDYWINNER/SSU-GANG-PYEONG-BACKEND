import express from "express";

const authRouter = express.Router();

import { register } from "../controllers/authController";

authRouter.route("/register").post(register);

export default authRouter;
