import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      "mongodb+srv://root:RTc3AIVXefOv0iG9@cluster0.nrlw0bt.mongodb.net/sarahaApp";
    const connection = await mongoose.connect(uri);
    console.log("Database connected successfully👌");
  } catch (error) {
    console.log("fail to connect to database.", error);
  }
};

export default connectDB;
