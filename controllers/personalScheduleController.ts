import { Response } from "express";
import { AuthRequest } from "../middleware/authenticateUser";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/tokenUtils";
import {} from "../types";

const createNewPS = async (req: AuthRequest, res: Response) => {
  try {
    console.log(req.body);
    const { user } = req;

    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { [`personalSchedule`]: req.body } },
      { new: true, runValidators: true }
    );

    const db_user = await User.findOne({ _id: user });

    const token = createJWT(db_user!._id, db_user!.adminAccount);

    if (updatedUser) {
      res.status(StatusCodes.OK).json({ db_user, token });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in createNewPS", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in Creating Personal Schedule" });
    throw error;
  }
};

const updatePS = async (req: AuthRequest, res: Response) => {
  try {
    const { name, oldName } = req.body;
    const { user } = req;

    const db_user = await User.findOne({ _id: user });

    const newClassHistory: { [key: string]: any } = {};
    for (const key of Object.keys(db_user!.classHistory)) {
      if (key === oldName) {
        newClassHistory[name] = db_user!.classHistory[oldName];
      } else {
        newClassHistory[key] = db_user!.classHistory[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user,
      { $set: { classHistory: newClassHistory } },
      { new: true }
    );

    const token = createJWT(db_user!._id, db_user!.adminAccount);

    if (updatedUser) {
      res.status(StatusCodes.OK).json({ db_user, token });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in updateTableName", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in update table name" });
    throw error;
  }
};

const deletePS = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.body;
    const { user } = req;

    const updatedUser = await User.findOneAndUpdate(
      { _id: user },
      { $pull: { personalSchedule: { courseId: courseId } } },
      { new: true }
    );

    const db_user = await User.findOne({ _id: user });

    if (updatedUser) {
      res.status(StatusCodes.OK).json({ db_user });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in deletePS", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in deleting personal schedule" });
    throw error;
  }
};

export { createNewPS, deletePS, updatePS };
