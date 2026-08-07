import mongoose from "mongoose";

const connectDB = async () => {
  try{
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    console.log(`Database: ${connectionInstance.connection.name}`);

  }
  catch(error){
    console.error("Error connecting to MongoDB:", error);
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;