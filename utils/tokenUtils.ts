import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const createJWT = (_id: string | Types.ObjectId, adminAccount: boolean) => {
  let authenticatedUserToken = "";
  if (adminAccount) {
    authenticatedUserToken = jwt.sign(
      { _id },
      process.env.JWT_SECRET as string
    );
  } else {
    authenticatedUserToken = jwt.sign(
      { _id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );
  }
  return authenticatedUserToken;
};

export { createJWT };
