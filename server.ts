import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import "express-async-errors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import {
  notFoundMiddleware,
  errorHandlerMiddleware,
  authenticateUser,
} from "./middleware";

import authRouter from "./routers/authRouter";
import toDoCategoryRouter from "./routers/toDoCategoryRouter";
import toDoTaskRouter from "./routers/toDoTaskRouter";
import courseRouter from "./routers/courseRouter";
import bulletinRouter from "./routers/bulletinRouter";
import tableRouter from "./routers/tableRouter";
import personalScheduleRouter from "./routers/personalScheduleRouter";

const app: Application = express();
const logger = morgan("dev");

//middlewares
if (process.env.NODE_ENV !== "production") {
  app.use(logger);
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());

//routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/ps", authenticateUser, personalScheduleRouter);
app.use("/api/v1/table", authenticateUser, tableRouter);
app.use("/api/v1/todocategory", authenticateUser, toDoCategoryRouter);
app.use("/api/v1/todotask", authenticateUser, toDoTaskRouter);
app.use("/api/v1/course", authenticateUser, courseRouter);
app.use("/api/v1/bulletin", authenticateUser, bulletinRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
