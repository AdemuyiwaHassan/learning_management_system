import express from "express";
import { createLevel } from "../controllers/level.ts";
import { authorize, protect } from "../middlewares/auth.ts";

const levelRouter = express.Router();

levelRouter.route("/create").post(protect, authorize(["admin"]), createLevel);

export default levelRouter;
