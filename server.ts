import express, { Application, Request, Response } from "express";
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

const app: Application = express();
const logger = morgan("dev");

// app.get("/ping", (request: Request, response: Response) => {
//   response.send("Pong");
// });

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
app.use("/api/v1/todocategory", authenticateUser, toDoCategoryRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
