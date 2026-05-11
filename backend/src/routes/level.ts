import express from "express";
import {
  createLevel,
  updateLevel,
  getAllLevels,
  deleteLevel,
} from "../controllers/level.ts";
import { authorize, protect } from "../middlewares/auth.ts";

const levelRouter = express.Router();

levelRouter.route("/create").post(protect, authorize(["admin"]), createLevel);

levelRouter
  .route("/update/:id")
  .patch(protect, authorize(["admin"]), updateLevel);

levelRouter.route("/").get(protect, authorize(["admin"]), getAllLevels);
levelRouter
  .route("/delete/:id")
  .delete(protect, authorize(["admin"]), deleteLevel);

export default levelRouter;
