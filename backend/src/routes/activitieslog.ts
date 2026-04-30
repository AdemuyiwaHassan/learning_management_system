import express from "express";
import { logActivity } from "../utils/activitieslog";
import { protect, authorize } from "../middlewares/auth";
import { getAllActivities } from "../controllers/activtieslog";

const logsRouter = express.Router();

logsRouter.get(
  "/",
  protect,
  authorize(["admin", "lecturer"]),
  getAllActivities,
);

export default logsRouter;
