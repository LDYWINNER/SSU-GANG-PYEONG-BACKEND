import { Response } from "express";
import { AuthRequest } from "../middleware/authenticateUser";
import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { createJWT } from "../utils/tokenUtils";

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
    const { id, courseId, sections } = req.body;
    const { user } = req;

    console.log(req.body);

    const updateQuery = {
      $set: {
        "personalSchedule.$[elem].courseId": courseId,
        "personalSchedule.$[elem].sections": sections,
      },
    };

    const arrayFilters = [{ "elem.id": id }];

    const updatedUser = await User.findByIdAndUpdate(user, updateQuery, {
      new: true,
      arrayFilters: arrayFilters,
    });

    // const db_user = await User.findOne({ _id: user });

    // if (!db_user) {
    //   return res.status(404).json({ message: "User not found." });
    // }

    // const itemIndex = db_user.personalSchedule.findIndex(
    //   (item: any) => item.id === id
    // );

    // if (itemIndex !== -1) {
    //   db_user.personalSchedule[itemIndex].courseId = courseId;
    //   db_user.personalSchedule[itemIndex].sections = sections;

    //   console.log(db_user.personalSchedule[itemIndex].sections.LEC);

    //   const updatedUser = await db_user.save();

    //   res.status(StatusCodes.OK).json({ db_user: updatedUser });
    // } else {
    //   res.status(404).json({ message: "Schedule item not found." });
    // }
    if (updatedUser) {
      res.status(StatusCodes.OK).json({ db_user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in updatePS", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in update personal schedule" });
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
