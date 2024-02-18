import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authenticateUser";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/tokenUtils";
import { BadRequestError } from "../errors";

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, school, major } = req.body;

    //check if already exist user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(StatusCodes.CONFLICT)
        .send({ message: "User already exist with this email" });
    }

    const user = await User.create({
      username,
      email,
      school,
      major,
      courseReviewNum: 0,
      classHistory: {
        "2024-spring": [],
      },
    });

    return res.status(StatusCodes.CREATED).json({
      user: {
        username: user.username,
        email: user.email,
        school: user.school,
        major: user.major,
        courseReviewNum: user.courseReviewNum,
        classHistory: user.classHistory,
      },
    });
  } catch (error) {
    console.log("error in register", error);
    throw error;
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.CONFLICT)
        .send({ message: "User doesn't exist" });
    }

    const token = createJWT(user._id, user.adminAccount);

    res.status(StatusCodes.OK).json({
      user: {
        username: user!.username,
        email: user!.email,
        school: user!.school,
        major: user!.major,
        courseReviewNum: user!.courseReviewNum,
        classHistory: user!.classHistory,
        _id: user!._id,
      },
      token,
    });
  } catch (error) {
    console.log("error in login", error);
    throw error;
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  const { user, username } = req.body;
  if (!username) {
    throw new BadRequestError("Please check if you provided all values");
  }

  const db_user = await User.findOne({ _id: user });

  db_user!.username = username;

  await db_user?.save();

  const token = createJWT(db_user!._id, db_user!.adminAccount);

  res.status(StatusCodes.OK).json({ db_user, token });
};

export { register, login, updateUser };
