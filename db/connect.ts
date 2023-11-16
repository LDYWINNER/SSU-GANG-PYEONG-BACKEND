import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connectDB = async (url: string) => {
  try {
    const connection = await mongoose.connect(url);
    if (connection) {
      console.log("Connection established :)");
    }
  } catch (error) {
    console.log("error in connectDB", error);
    throw error;
  }
};

export default connectDB;
