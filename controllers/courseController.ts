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
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

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
    | { semesters: { $in: any } }
  )[];
}

const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({});
    return res.json(courses);
  } catch (error) {
    console.log("error in getAllCourses", error);
    res.json({ error: "Error in getting all the categories" });
    throw error;
  }
};

const getSearchQueryCourses = async (req: AuthRequest, res: Response) => {
  const { searchSubj: subj, keyword: search } = req.query;

  if (subj === "ALL" && search === undefined) {
    const queryCourses = await Course.find();
    const totalCourses = await Course.countDocuments(queryCourses);

    return res.status(StatusCodes.OK).json({
      queryCourses,
      totalCourses,
    });
  } else if (subj === "ALL" && search !== undefined) {
    const queryCourses = await Course.find({
      $and: [
        {
          $or: [
            { crs: { $regex: search, $options: "i" } },
            { courseTitle: { $regex: search, $options: "i" } },
            { instructor_names: { $regex: search, $options: "i" } },
          ],
        },
      ],
    });
    const totalCourses = await Course.countDocuments(queryCourses);

    return res.status(StatusCodes.OK).json({
      queryCourses,
      totalCourses,
    });
  }

  let queryObject: IQueryObject = { subj };

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

  if (search) {
    queryObject.$and!.push({
      $or: [
        { crs: { $regex: search, $options: "i" } },
        { courseTitle: { $regex: search, $options: "i" } },
        { instructor_names: { $regex: search, $options: "i" } },
      ],
    });
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

const getTableSelectQueryCourses = async (req: AuthRequest, res: Response) => {
  const { searchSubj: subj, keyword: search } = req.query;

  // 475, 476, 487, 488, 499, 522, 523, 524, 587, 593, 596, 599, 696, 697, 698, 699, 700 처리 + only 2024_courses for tableview
  const semesterCondition = { semesters: { $in: ["2024_spring"] } };
  const upperCourseCondition = {
    $nor: [
      { crs: "475" },
      { crs: "476" },
      { crs: "487" },
      { crs: "488" },
      { crs: "499" },
      { crs: "522" },
      { crs: "523" },
      { crs: "524" },
      { crs: "587" },
      { crs: "593" },
      { crs: "596" },
      { crs: "599" },
      { crs: "696" },
      { crs: "697" },
      { crs: "698" },
      { crs: "699" },
      { crs: "700" },
    ],
  };

  if (subj === "ALL" && search === undefined) {
    const queryCourses = await Course.find({
      $and: [semesterCondition, upperCourseCondition],
    });
    const totalCourses = await Course.countDocuments(queryCourses);

    return res.status(StatusCodes.OK).json({
      queryCourses,
      totalCourses,
    });
  } else if (subj === "ALL" && search !== undefined) {
    const queryCourses = await Course.find({
      $and: [
        {
          $or: [
            { crs: { $regex: search, $options: "i" } },
            { courseTitle: { $regex: search, $options: "i" } },
            { instructor_names: { $regex: search, $options: "i" } },
          ],
        },
        semesterCondition,
        upperCourseCondition,
      ],
    });
    const totalCourses = await Course.countDocuments(queryCourses);

    return res.status(StatusCodes.OK).json({
      queryCourses,
      totalCourses,
    });
  }

  let queryObject: IQueryObject = {
    $and: [{ subj }, semesterCondition, upperCourseCondition],
  };

  if (subj === "ACC/BUS") {
    queryObject = {
      $and: [
        { $or: [{ subj: "ACC" }, { subj: "BUS" }] },
        semesterCondition,
        upperCourseCondition,
      ],
    };
  }

  if (subj === "EST/EMP") {
    queryObject = {
      $and: [
        { $or: [{ subj: "EST" }, { subj: "EMP" }] },
        semesterCondition,
        upperCourseCondition,
      ],
    };
  }

  if (subj === "SHCourse") {
    queryObject = {
      $and: [
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
        semesterCondition,
        upperCourseCondition,
      ],
    };
  }

  if (search) {
    queryObject.$and!.push({
      $or: [
        { crs: { $regex: search, $options: "i" } },
        { courseTitle: { $regex: search, $options: "i" } },
        { instructor_names: { $regex: search, $options: "i" } },
      ],
    });
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
      _id: user?.classHistory[tableName][i].id,
    });

    if (!course) {
      throw new NotFoundError(
        `No course with id: ${user?.classHistory[tableName][i].id}`
      );
    }

    if (course.subj === "CHI" && course.crs === "111") {
      const complicatedCourseOption = user?.classHistory[tableName][i]
        .complicatedCourseOption as string;
      // console.log("complicatedCourseOption", complicatedCourseOption);

      const tempDays = course.day.split(", ");
      const tempLocation = course.room.split(", ");
      const tempStartTime = course.startTime.split(", ");
      const tempEndTime = course.endTime.split(", ");

      const lastDay = tempDays.pop();
      const lastStartTime = tempStartTime.pop();
      const lastEndTime = tempEndTime.pop();

      const selectedOptions = complicatedCourseOption.split("  ");
      // console.log(selectedOptions);

      //days
      tempDays.push(selectedOptions[0]);
      const newDays = tempDays.join(", ");
      course.day = newDays;

      // start time
      tempStartTime.push(selectedOptions[1]);
      const newStartTimes = tempStartTime.join(", ");
      course.startTime = newStartTimes;

      // end time
      tempEndTime.push(selectedOptions[3]);
      const newEndTimes = tempEndTime.join(", ");
      course.endTime = newEndTimes;
    } else if (user?.classHistory[tableName][i].twoOptionsDay !== undefined) {
      // two options day courses: if user has to choose options of day

      // change the day & time & instructor & location value when getting the course
      const tempDays = course.day.split(", ");
      const tempLocation = course.room.split(", ");
      const tempStartTime = course.startTime.split(", ");
      const tempEndTime = course.endTime.split(", ");

      const lastTwoDays = tempDays.pop();
      const lastTwoDaysArray = lastTwoDays!.split("/");
      let recDays = "";
      if (lastTwoDaysArray[1].includes("(")) {
        recDays = lastTwoDaysArray[1].split("(")[1];
        // something like "f)"
      }
      const lastLocation = tempLocation.at(-1);
      const lastStartTimes = tempStartTime.at(-1);
      const lastEndTimes = tempEndTime.at(-1);
      const lastInstructors = course.instructor.at(-1);

      // console.log(lastTwoDaysArray[1]);
      // console.log(recDays);
      // console.log(lastLocation);
      // console.log(lastStartTimes);
      // console.log(lastEndTimes);
      // console.log(lastInstructors);

      // days
      let finalDay = "";
      if (recDays === "") {
        finalDay = user?.classHistory[tableName][i].twoOptionsDay as string;
        tempDays.push(finalDay);
      } else {
        finalDay =
          user?.classHistory[tableName][i].twoOptionsDay + "(" + recDays;
        tempDays.push(finalDay);
      }
      // console.log("finalDay", finalDay);
      const newDays = tempDays.join(", ");
      // console.log(newDays);
      course.day = newDays;

      // location(room) - if only includes /
      if (lastLocation?.includes("/")) {
        let newLocation = "";
        const lastTwoLocations = tempLocation.pop();
        const lastTwoLocationsArray = lastTwoLocations!.split("/");
        if (
          user?.classHistory[tableName][i].twoOptionsDay === lastTwoDaysArray[0]
        ) {
          newLocation = lastTwoLocationsArray[0];
        } else {
          newLocation = lastTwoLocationsArray[1];
        }
        tempLocation.push(newLocation);
        const newLocations = tempLocation.join(", ");
        // console.log(newLocations);
        course.room = newLocations;
      }
      // time - if only includes /
      if (lastStartTimes?.includes("/")) {
        let newStartTime = "";
        let newEndTime = "";
        let recStartTime = "";
        let recEndTime = "";
        let lastTwoStartTimes = tempStartTime.pop();
        let lastTwoEndTimes = tempEndTime.pop();
        // console.log("lastTwoStartTimes", lastTwoStartTimes);
        // console.log("lastTwoEndTimes", lastTwoEndTimes);
        if (recDays !== "") {
          recStartTime = lastTwoStartTimes?.split("(")[1] as string;
          recEndTime = lastTwoEndTimes?.split("(")[1] as string;

          lastTwoStartTimes = lastTwoStartTimes?.split("(")[0];
          lastTwoEndTimes = lastTwoEndTimes?.split("(")[0];

          // console.log("lastTwoStartTimes", lastTwoStartTimes);
          // console.log("lastTwoEndTimes", lastTwoEndTimes);
          // console.log(recStartTime);
          // console.log(recEndTime);
        }
        const lastTwoStartTimesArray = lastTwoStartTimes!.split("/");
        const lastTwoEndTimesArray = lastTwoEndTimes!.split("/");
        if (
          user?.classHistory[tableName][i].twoOptionsDay === lastTwoDaysArray[0]
        ) {
          newStartTime = lastTwoStartTimesArray[0];
          newEndTime = lastTwoEndTimesArray[0];
        } else {
          newStartTime = lastTwoStartTimesArray[1];
          newEndTime = lastTwoEndTimesArray[1];
        }
        if (recDays !== "") {
          newStartTime = newStartTime + "(" + recStartTime;
          newEndTime = newEndTime + "(" + recEndTime;
        }
        tempStartTime.push(newStartTime);
        tempEndTime.push(newEndTime);
        const newStartTimes = tempStartTime.join(", ");
        const newEndTimes = tempEndTime.join(", ");
        // console.log("newStartTimes", newStartTimes);
        // console.log("newEndTimes", newEndTimes);
        course.startTime = newStartTimes;
        course.endTime = newEndTimes;
      }
      // instructor - if only includes /
      if (lastInstructors?.includes("/")) {
        let newInstructor = "";
        const lastTwoInstructors = course.instructor.pop();
        const lastTwoInstructorsArray = lastTwoInstructors!.split("/");
        if (
          user?.classHistory[tableName][i].twoOptionsDay === lastTwoDaysArray[0]
        ) {
          newInstructor = lastTwoInstructorsArray[0];
        } else {
          newInstructor = lastTwoInstructorsArray[1];
        }
        course.instructor.push(newInstructor);
      }
    } else if (user?.classHistory[tableName][i].optionsTime !== undefined) {
      // time options course: same day but user has to choose options of time

      // change the day & time & instructor & location value when getting the course
      const tempDays = course.day.split(", ");
      const tempLocation = course.room.split(", ");
      const tempStartTime = course.startTime.split(", ");
      const tempEndTime = course.endTime.split(", ");

      const lastDays = tempDays.at(-1);
      const lastDaysArray = lastDays!.split("/");
      const lastLocation = tempLocation.at(-1);
      const lastInstructors = course.instructor.at(-1);

      const lastStartTimes = tempStartTime.pop();
      const lastEndTimes = tempEndTime.pop();
      const lastStartTimesArray = lastStartTimes!.split("/");
      const lastEndTimesArray = lastEndTimes!.split("/");

      // console.log(lastDays);
      // console.log(lastLocation);
      // console.log(lastStartTimes);
      // console.log(lastEndTimes);
      // console.log(lastInstructors);

      // time - if only includes /
      let newStartTime = "";
      let newEndTime = "";
      const lastStartTimesLength = lastStartTimesArray.length;
      // Check if the optionsTime matches any of the last start times in the array
      const matchedIndex = lastStartTimesArray.findIndex(
        (startTime) =>
          startTime === user?.classHistory[tableName][i].optionsTime
      );
      if (matchedIndex !== -1) {
        newStartTime = lastStartTimesArray[matchedIndex];
        newEndTime = lastEndTimesArray[matchedIndex];
      } else {
        newStartTime = lastStartTimesArray[lastStartTimesLength - 1];
        newEndTime = lastEndTimesArray[lastStartTimesLength - 1];
      }
      // if (
      //   user?.classHistory[tableName][i].optionsTime === lastStartTimesArray[0]
      // ) {
      //   newStartTime = lastStartTimesArray[0];
      //   newEndTime = lastEndTimesArray[0];
      // } else {
      //   newStartTime = lastStartTimesArray[1];
      //   newEndTime = lastEndTimesArray[1];
      // }
      tempStartTime.push(newStartTime);
      tempEndTime.push(newEndTime);
      const newStartTimes = tempStartTime.join(", ");
      const newEndTimes = tempEndTime.join(", ");
      // console.log(newStartTimes);
      // console.log(newEndTimes);
      course.startTime = newStartTimes;
      course.endTime = newEndTimes;

      // location(room) - if only includes /
      if (lastLocation?.includes("/")) {
        let newLocation = "";
        const lastLocations = tempLocation.pop();
        const lastLocationsArray = lastLocations!.split("/");
        if (matchedIndex !== -1) {
          newLocation = lastLocationsArray[matchedIndex];
        } else {
          newLocation = lastLocationsArray[lastStartTimesLength - 1];
        }
        // if (
        //   user?.classHistory[tableName][i].optionsTime ===
        //   lastStartTimesArray[0]
        // ) {
        //   newLocation = lastLocationsArray[0];
        // } else {
        //   newLocation = lastLocationsArray[1];
        // }
        tempLocation.push(newLocation);
        const newLocations = tempLocation.join(", ");
        // console.log(newLocations);
        course.room = newLocations;
      }
      // instructor - if only includes /
      if (lastInstructors?.includes("/")) {
        let newInstructor = "";
        const lastInstructors = course.instructor.pop();
        const lastInstructorsArray = lastInstructors!.split("/");
        if (matchedIndex !== -1) {
          newInstructor = lastInstructorsArray[matchedIndex];
        } else {
          newInstructor = lastInstructorsArray[lastStartTimesLength - 1];
        }
        // if (
        //   user?.classHistory[tableName][i].optionsTime ===
        //   lastStartTimesArray[0]
        // ) {
        //   newInstructor = lastTwoInstructorsArray[0];
        // } else {
        //   newInstructor = lastTwoInstructorsArray[1];
        // }
        course.instructor.push(newInstructor);
      }
    }

    takingCourses.push(course);
  }

  res.status(StatusCodes.OK).json({ takingCourses });
};

const addTableViewCourse = async (req: AuthRequest, res: Response) => {
  const {
    tableName: { currentTableView },
    courseId,
    color,
    twoOptionsDay,
    optionsTime,
    complicatedCourseOption,
  }: {
    tableName: { currentTableView: string };
    courseId: string;
    color: string;
    complicatedCourseOption?: string;
    twoOptionsDay?: string;
    optionsTime?: string;
  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    {
      $addToSet: {
        [`classHistory.${currentTableView}`]: complicatedCourseOption
          ? { id: courseId, complicatedCourseOption: complicatedCourseOption }
          : twoOptionsDay
          ? { id: courseId, twoOptionsDay: twoOptionsDay }
          : optionsTime
          ? { id: courseId, optionsTime: optionsTime }
          : { id: courseId },
      },
    },
    { new: true, runValidators: true }
  );

  // console.log(updatedUser);

  const course = await Course.findOne({ _id: courseId });
  // console.log(course);

  const category = await ToDoCategory.findOne({
    name: `${course!.subj} ${course!.crs}`,
    user: req.user,
  });

  if (!category) {
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

    const newCategory = await ToDoCategory.create({
      color,
      icon: {
        id: `${course!.subj} ${course!.crs}`,
        name: `${course!.subj.toLowerCase()}`,
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
      {
        $pull: {
          [`classHistory.${currentTableView}`]: { id: courseId },
        },
      },
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

const deleteAllTableViewCourse = async (req: AuthRequest, res: Response) => {
  const {
    tableName: { currentTableView },
  } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { $set: { [`classHistory.${currentTableView}`]: [] } },
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

const appDir = path.dirname(require.main?.filename as string);

const reportEmail = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const review = await CourseReview.findOne({ _id: id });

  // console.log(review);

  if (!review) {
    throw new NotFoundError(`No review with id: ${id}`);
  }

  //send email to admin
  let emailTemplete;
  ejs.renderFile(
    appDir + "/template/reportCourseReviewMail.ejs",
    {
      type: "Course Review",
      id: id,
    },
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
    to: process.env.REPORT_EMAIL,
    subject: "SSUGANGPYEONG Report",
    html: emailTemplete,
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    // console.log("Finish sending email : " + info.response);
    // console.log("loginEmailConfirmationNum : ", loginEmailConfirmationNum);

    res.send({ message: "Report email sent successfully" });
    transporter.close();
  });

  // send email to review creator
};

export {
  getAllCourses,
  getSearchQueryCourses,
  getTableSelectQueryCourses,
  likeCourse,
  getSingleCourse,
  createReview,
  likeReview,
  updateUserCourseNum,
  getTableViewCourses,
  addTableViewCourse,
  deleteTableViewCourse,
  deleteAllTableViewCourse,
  reportEmail,
};
