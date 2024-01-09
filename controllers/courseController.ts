import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../errors";
import { AuthRequest } from "../middleware/authenticateUser";
import Course, { ICourse } from "../models/Course";
import CourseReview from "../models/CourseReview";
import ToDoCategory from "../models/ToDoCategory";
import User from "../models/User";
import { createJWT } from "../utils/tokenUtils";

interface IQueryObject {
  [x: string]: any;
  $and?: (
    | {
        $or: any;
      }
    | {
        subj: any;
      }
    | { $nor: any }
  )[];
}

const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({});
    return res.send(courses);
  } catch (error) {
    console.log("error in getAllCourses", error);
    res.send({ error: "Error in getting all the categories" });
    throw error;
  }
};

const getQueryCourses = async (req: AuthRequest, res: Response) => {
  const { searchSubj: subj, keyword: search } = req.query;

  if (subj === "ALL" && search === undefined) {
    const queryCourses = await Course.find({});
    const totalCourses = await Course.countDocuments(queryCourses);

    return res.status(StatusCodes.OK).json({
      queryCourses,
      totalCourses,
    });
  } else if (subj === "ALL" && search !== undefined) {
    const queryCourses = await Course.find({
      $or: [
        { crs: { $regex: search, $options: "i" } },
        { courseTitle: { $regex: search, $options: "i" } },
        { instructor_names: { $regex: search, $options: "i" } },
      ],
    });
    const totalCourses = await Course.countDocuments(queryCourses);

    return res.status(StatusCodes.OK).json({
      queryCourses,
      totalCourses,
    });
  }

  let queryObject: IQueryObject = {
    subj,
  };

  if (subj === "ACC/BUS") {
    queryObject = {
      $or: [{ subj: "ACC" }, { subj: "BUS" }],
    };
  }

  if (subj === "EST/EMP") {
    queryObject = {
      $or: [{ subj: "EST" }, { subj: "EMP" }],
    };
  }

  if (subj === "SHCourse") {
    queryObject = {
      $nor: [
        { subj: "AMS" },
        { subj: "ACC" },
        { subj: "BUS" },
        { subj: "CSE" },
        { subj: "ESE" },
        { subj: "EST" },
        { subj: "EMP" },
        { subj: "MEC" },
      ],
    };
  }

  if (search && subj !== "SHCourse") {
    if (subj === "ACC/BUS") {
      queryObject = {
        $and: [
          {
            $or: [
              { crs: { $regex: search, $options: "i" } },
              { courseTitle: { $regex: search, $options: "i" } },
              { instructor_names: { $regex: search, $options: "i" } },
            ],
          },
          { $or: [{ subj: "ACC" }, { subj: "BUS" }] },
        ],
      };
    } else if (subj === "EST/EMP") {
      queryObject = {
        $and: [
          {
            $or: [
              { crs: { $regex: search, $options: "i" } },
              { courseTitle: { $regex: search, $options: "i" } },
              { instructor_names: { $regex: search, $options: "i" } },
            ],
          },
          { $or: [{ subj: "EST" }, { subj: "EMP" }] },
        ],
      };
    } else {
      queryObject = {
        $and: [
          {
            $or: [
              { crs: { $regex: search, $options: "i" } },
              { courseTitle: { $regex: search, $options: "i" } },
              { instructor_names: { $regex: search, $options: "i" } },
            ],
          },
          { subj },
        ],
      };
    }
  } else if (search && subj === "SHCourse") {
    queryObject = {
      $and: [
        {
          $or: [
            { crs: { $regex: search, $options: "i" } },
            { courseTitle: { $regex: search, $options: "i" } },
            { instructor_names: { $regex: search, $options: "i" } },
          ],
        },
        {
          $nor: [
            { subj: "AMS" },
            { subj: "ACC" },
            { subj: "BUS" },
            { subj: "CSE" },
            { subj: "ESE" },
            { subj: "EST" },
            { subj: "EMP" },
            { subj: "MEC" },
          ],
        },
      ],
    };
  }

  let result = Course.find(queryObject);

  if (subj === "SHCourse") {
    result = result.sort("subj");
  } else if (subj !== "ACC/BUS") {
    result = result.sort("crs");
  }

  const queryCourses = await result;
  const totalCourses = await Course.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    queryCourses,
    totalCourses,
  });
};

const likeCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { id: courseId } = req.query;

    const course = await Course.findOne({ _id: courseId });

    if (!course) {
      throw new NotFoundError(`No course with id: ${courseId}`);
    }

    if (user) {
      if (course.likes.includes(user)) {
        const index = course.likes.indexOf(user);
        course.likes.splice(index, 1);
      } else {
        course.likes.push(user);
      }

      const updatedCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { likes: course.likes }
      );
      res.status(StatusCodes.OK).json({ updatedCourse });
    }
  } catch (error) {}
};

const getSingleCourse = async (req: AuthRequest, res: Response) => {
  const { id: courseId } = req.params;

  const course = await Course.findOne({ _id: courseId });

  if (!course) {
    throw new NotFoundError(`No course with id: ${courseId}`);
  }

  course.reviews = await CourseReview.find({ course: courseId });

  res.status(StatusCodes.OK).json(course);
};

const createReview = async (req: AuthRequest, res: Response) => {
  const {
    params: { id: courseId },
    body: {
      semester,
      homeworkQuantity,
      teamProjectPresence,
      difficulty,
      testQuantity,
      testType,
      quizPresence,
      overallGrade,
      instructor,
      generosity,
      attendance,
    },
  } = req;

  try {
    const course = await Course.findOne({ _id: courseId });

    if (!course) {
      throw new NotFoundError(`No course with id: ${courseId}`);
    }

    if (
      !semester ||
      !homeworkQuantity ||
      teamProjectPresence === null ||
      !difficulty ||
      !testQuantity ||
      !testType ||
      quizPresence === null ||
      !overallGrade ||
      !instructor ||
      !generosity ||
      !attendance
    ) {
      throw new BadRequestError("Please provide all values");
    }

    const ObjectId = mongoose.Types.ObjectId;
    const alreadyCourse = await CourseReview.findOne({
      createdBy: new ObjectId(req.user),
      course: new ObjectId(courseId),
    });

    if (alreadyCourse) {
      throw new BadRequestError(
        "You already submitted course review for this course :)"
      );
    }

    //update course grade
    course.reviews = await CourseReview.find({ course: courseId });
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $set: {
          avgGrade:
            (course.avgGrade + overallGrade) / (course.reviews.length + 1),
        },
      },
      { new: true } // This option will return the updated document
    );
    // console.log(updatedCourse);

    req.body.createdBy = req.user;
    req.body.course = courseId;

    const fetchUsername = async (userId: string) => {
      return User.findOne({ _id: userId }).then((user) => user?.username);
    };
    let username = await fetchUsername(req.user as string);
    req.body.createdByUsername = username;

    const courseReview = await CourseReview.create(req.body);
    course.reviews.push(courseReview._id);
    course.save();

    res.status(StatusCodes.CREATED).json({ courseReview });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
};

const likeReview = async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;

  const review = await CourseReview.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  if (review.likes.includes(req.user as string)) {
    const index = review.likes.indexOf(req.user as string);
    review.likes.splice(index, 1);
  } else {
    review.likes.push(req.user as string);
  }
  const updatedReview = await CourseReview.findOneAndUpdate(
    { _id: reviewId },
    { likes: review.likes }
  );
  res.status(StatusCodes.OK).json({ updatedReview });
};

const updateUserCourseNum = async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ _id: req.user });

  user!.courseReviewNum++;

  await user?.save();

  const token = createJWT(user!._id, user!.adminAccount);

  res.status(StatusCodes.OK).json({ user, token });
};

const getTableViewCourses = async (req: AuthRequest, res: Response) => {
  const { tableName } = req.params;
  const user = await User.findOne({ _id: req.user });
  const takingCourses: ICourse[] = [];

  for (let i = 0; i < user!.classHistory[tableName].length; i++) {
    const course = await Course.findOne({
      _id: user?.classHistory[tableName][i],
    });

    if (!course) {
      throw new NotFoundError(
        `No course with id: ${user?.classHistory[tableName][i]}`
      );
    }

    takingCourses.push(course);
  }

  res.status(StatusCodes.OK).json({ takingCourses });
};

const addTableViewCourse = async (req: AuthRequest, res: Response) => {
  const {
    tableName: { currentTableView },
    courseId,
  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    { $addToSet: { [`classHistory.${currentTableView}`]: courseId } },
    { new: true, runValidators: true }
  );

  console.log(updatedUser);

  const course = await Course.findOne({ _id: courseId });
  console.log(course);

  const category = await ToDoCategory.findOne({
    name: `${course!.subj} ${course!.crs}`,
  });

  if (!category && currentTableView === "2023-fall") {
    let subjIcon = "";
    switch (course!.subj) {
      case "AMS":
        subjIcon = "📐";
        break;
      case "ACC":
        subjIcon = "📈";
        break;
      case "BUS":
        subjIcon = "💰";
        break;
      case "CSE":
        subjIcon = "💻";
        break;
      case "ESE":
        subjIcon = "💡";
        break;
      case "EST" || "EMP":
        subjIcon = "👥";
        break;
      case "MEC":
        subjIcon = "🔋";
        break;
      case "WRT" || "WAE":
        subjIcon = "📝";
        break;
      default:
        subjIcon = "🎧";
        break;
    }

    let ratingColor = "";
    if (course!.avgGrade === null) {
      ratingColor = "#EDECEF";
    } else if (course!.avgGrade <= 1) {
      ratingColor = "#fecaca";
    } else if (course!.avgGrade <= 2) {
      ratingColor = "#fde68a";
    } else if (course!.avgGrade <= 3) {
      ratingColor = "#fed7aa";
    } else if (course!.avgGrade <= 4) {
      ratingColor = "#bfdbfe";
    } else {
      ratingColor = "#bbf7d0";
    }

    const newCategory = await ToDoCategory.create({
      color: {
        id: `${course!.subj} ${course!.crs}`,
        name: `${course!.subj} ${course!.crs}`,
        code: ratingColor,
      },
      icon: {
        id: `${course!.subj} ${course!.crs}`,
        name: `${course!.subj}`,
        symbol: subjIcon,
      },
      isEditable: true,
      name: `${course!.subj} ${course!.crs}`,
      user: req.user,
    });
  }

  const token = createJWT(updatedUser!._id, updatedUser!.adminAccount);

  res.status(StatusCodes.OK).json({ updatedUser, token });
};

const deleteTableViewCourse = async (req: AuthRequest, res: Response) => {
  const {
    tableName: { currentTableView },
    courseId,
  } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { $pull: { [`classHistory.${currentTableView}`]: courseId } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }

    const token = createJWT(updatedUser._id, updatedUser.adminAccount);

    res.status(StatusCodes.OK).json({ updatedUser, token });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
};

export {
  getAllCourses,
  getQueryCourses,
  likeCourse,
  getSingleCourse,
  createReview,
  likeReview,
  updateUserCourseNum,
  getTableViewCourses,
  addTableViewCourse,
  deleteTableViewCourse,
};
