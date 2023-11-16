import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {
    console.log("error in auth middleware", error);
    throw new UnAuthenticatedError("Authentication Invalid");
  }
};

export default auth;
