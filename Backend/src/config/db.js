import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("MongoDB URI not set, running without database.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.warn("MongoDB not connected, running in mock/demo mode.");
    return false;
  }
};

export default connectDB;
