import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import User from "../models/User";

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnAuthenticatedError("Authentication Invalid");
    }
    const token = authorization;
    // const { _id } = jwt.verify(token, process.env.JWT_SECRET as string);
    const { _id } = jwt.verify(
      token,
      process.env.JWT_SECRET as Secret
    ) as JwtPayload;
    const existingUser = await User.findOne({ _id });

    if (existingUser) {
      req.user = existingUser.id;
    }
    next();
  } catch (error) {
    console.log("error in auth middleware", error);
    throw new UnAuthenticatedError("Authentication Invalid");
  }
};

export default authenticateUser;
