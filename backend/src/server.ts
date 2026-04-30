import cookieParser from "cookie-parser";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db";
import userRoutes from "./routes/user";
import logsRouter from "./routes/activitieslog";
import academicYearRouter from "./routes/academicYear";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet()); // Middleware to set security-related HTTP headers
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cookieParser()); // Middleware to parse cookies

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Middleware for logging HTTP requests in development mode
}

app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
  }),
); // Middleware to enable Cross-Origin Resource Sharing (CORS)

//health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Import and use user routes
app.use("/api/users", userRoutes);
app.use("/api/activities", logsRouter);
app.use("/api/academic-years", academicYearRouter);

// global error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // Connect to the database when the server starts
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database", error);
    process.exit(1); // Exit the process with an error code
  });
