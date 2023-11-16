import { Request, Response } from "express";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, school, major } = req.body;

    //check if already exist user
    const existingUser = await User.find({ email });
    if (existingUser) {
      return res
        .status(StatusCodes.CONFLICT)
        .send("user already exist with this email");
    }

    const user = await User.create({
      username,
      email,
      school,
      major,
      courseReviewNum: 0,
    });

    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
      user: {
        username: user.username,
        email: user.email,
        school: user.school,
        major: user.major,
        courseReviewNum: user.courseReviewNum,
      },
      token,
    });
  } catch (error) {
    console.log("error in register", error);
    throw error;
  }
};

export { register };
