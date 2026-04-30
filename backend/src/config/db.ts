import mongoose from "mongoose";

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

// Connect to MongoDB and start the server
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with an error code
  }
};
