import { Response } from "express";
import { AuthRequest } from "../middleware/authenticateUser";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/tokenUtils";
import { ITable, IUpdateTable } from "../types";

const createNewTable = async (req: AuthRequest, res: Response) => {
  try {
    const { name }: ITable = req.body;
    const { user } = req;

    const update = {
      [`classHistory.${name}`]: [],
    };

    const updatedUser = await User.findByIdAndUpdate(
      user,
      { $set: update },
      { new: true }
    );

    const db_user = await User.findOne({ _id: user });

    const token = createJWT(db_user!._id, db_user!.adminAccount);

    if (updatedUser) {
      res.status(StatusCodes.OK).json({ db_user, token });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in createNewTable", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in Creating New Table" });
    throw error;
  }
};

const updateTableName = async (req: AuthRequest, res: Response) => {
  try {
    const { name, oldName }: IUpdateTable = req.body;
    const { user } = req;

    const db_user = await User.findOne({ _id: user });

    // const tempClassHistories = db_user!.classHistory[oldName];

    const newClassHistory: { [key: string]: any } = {};
    for (const key of Object.keys(db_user!.classHistory)) {
      if (key === oldName) {
        // Rename the key
        newClassHistory[name] = db_user!.classHistory[oldName];
      } else {
        newClassHistory[key] = db_user!.classHistory[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user,
      { $set: { classHistory: newClassHistory } },
      { new: true } // Return the updated document
    );

    // const updatedUser = await User.findByIdAndUpdate(
    //   user,
    //   { $set: { [`classHistory.${name}`]: tempClassHistories } },
    //   { new: true }
    // );

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

const deleteTable = async (req: AuthRequest, res: Response) => {
  try {
    const { name }: ITable = req.body;
    const { user } = req;

    const update = { [`classHistory.${name}`]: [] };

    const updatedUser = await User.findByIdAndUpdate(
      user,
      { $unset: update },
      { new: true }
    );

    // console.log(updatedUser, "updatedUser");

    const db_user = await User.findOne({ _id: user });

    const token = createJWT(db_user!._id, db_user!.adminAccount);

    if (updatedUser) {
      res.status(StatusCodes.OK).json({ db_user, token });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in deleteCategory", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in deleting the category" });
    throw error;
  }
};

export { createNewTable, deleteTable, updateTableName };
