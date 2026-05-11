import express from "express";
import {
  createLevel,
  updateLevel,
  getAllLevels,
} from "../controllers/level.ts";
import { authorize, protect } from "../middlewares/auth.ts";

const levelRouter = express.Router();

levelRouter.route("/create").post(protect, authorize(["admin"]), createLevel);

levelRouter
  .route("/update/:id")
  .patch(protect, authorize(["admin"]), updateLevel);

levelRouter.route("/").get(protect, authorize(["admin"]), getAllLevels);

export default levelRouter;
