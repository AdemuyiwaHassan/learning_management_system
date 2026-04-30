import express from "express";

const userRoutes = express.Router();

import {
  resgisterUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserProfile,
  logoutUser,
  getUsers,
} from "../controllers/user";
import { protect, authorize } from "../middlewares/auth";

userRoutes.get("/", protect, authorize(["admin", "lecturer"]), getUsers);

userRoutes.post(
  "/register",
  protect,
  authorize(["admin", "lecturer"]),
  resgisterUser,
);
userRoutes.post("/login", loginUser);
userRoutes.patch(
  "/update/:id",
  protect,
  authorize(["admin", "lecturer"]),
  updateUser,
);
userRoutes.delete(
  "/delete/:id",
  protect,
  authorize(["admin", "lecturer"]),
  deleteUser,
);

userRoutes.get("/profile", protect, getUserProfile);
userRoutes.post("/logout", logoutUser);

export default userRoutes;
