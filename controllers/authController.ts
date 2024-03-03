import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authenticateUser";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/tokenUtils";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

const appDir = path.dirname(require.main?.filename as string);

let registerEmailConfirmationNum = 0;
let loginEmailConfirmationNum = 0;

// for email
const generateRandom = (min: number, max: number) => {
  const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum;
};

const registerEmail = async (req: Request, res: Response) => {
  const { username, email, school, major } = req.body;
  if (!username || !email || school === "-1" || major === "-2") {
    throw new BadRequestError("Please check if you provided all values");
  }
  //duplicate email checking
  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    return res
      .status(StatusCodes.CONFLICT)
      .send({ message: "User already exist with this email" });
  }

  let authNum = generateRandom(111111, 999999);
  let emailTemplete;
  ejs.renderFile(
    appDir + "/template/authMail.ejs",
    { authCode: authNum },
    function (err, data) {
      if (err) {
        console.log(err);
      }
      emailTemplete = data;
    }
  );

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = await transporter.sendMail({
    from: `"SSUGANGPYEONG" <${process.env.NODEMAILER_USER}>`,
    to: req.body.email,
    subject: "SSUGANGPYEONG Register Email Verfication",
    html: emailTemplete,
  });

  registerEmailConfirmationNum = authNum;

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }

    // console.log("Finish sending email : " + info.response);

    res.send({ authNum: registerEmailConfirmationNum });
    transporter.close();
  });
};

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, school, major } = req.body;
    console.log(req.body);

    const user = await User.create({
      username,
      email,
      school,
      major,
      courseReviewNum: 0,
      classHistory: {
        "2024-spring": [],
      },
      personalSchedule: [],
    });

    const token = createJWT(user._id, user.adminAccount);

    return res.status(StatusCodes.CREATED).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        school: user.school,
        major: user.major,
        courseReviewNum: user.courseReviewNum,
        classHistory: user.classHistory,
        personalSchedule: user.personalSchedule,
      },
      token,
    });
  } catch (error) {
    console.log("error in register", error);
    throw error;
  }
};

const loginEmail = async (req: Request, res: Response) => {
  const { email }: { email: string } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  if (!email) {
    throw new BadRequestError("Please provide valid email");
  }
  const user = await User.findOne({ email: lowerCaseEmail });
  if (!user) {
    throw new UnAuthenticatedError("Login failed");
  }
  // console.log(user);

  if (user.adminAccount) {
    return res.send({ authNum: -1, loginSkip: true });
  }

  //send email
  let authNum = generateRandom(1, 99);
  let emailTemplete;
  ejs.renderFile(
    appDir + "/template/loginMail.ejs",
    { authCode: authNum },
    function (err, data) {
      if (err) {
        console.log(err);
      }
      emailTemplete = data;
    }
  );

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = await transporter.sendMail({
    from: `"SSUGANGPYEONG" <${process.env.NODEMAILER_USER}>`,
    to: req.body.email,
    subject: "SSUGANGPYEONG Login Email Verfication",
    html: emailTemplete,
  });

  loginEmailConfirmationNum = authNum;

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    // console.log("Finish sending email : " + info.response);
    // console.log("loginEmailConfirmationNum : ", loginEmailConfirmationNum);

    res.send({ authNum: loginEmailConfirmationNum });
    transporter.close();
  });
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
        _id: user!._id,
        username: user!.username,
        email: user!.email,
        school: user!.school,
        major: user!.major,
        courseReviewNum: user!.courseReviewNum,
        classHistory: user!.classHistory,
        personalSchedule: user!.personalSchedule,
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

export { registerEmail, register, loginEmail, login, updateUser };
