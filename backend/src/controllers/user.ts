import { type Request, type Response } from "express";
import User from "../models/user";
import { generateToken } from "../utils/generateToken";
import { logActivity } from "../utils/activitieslog";
import type { AuthRequest } from "../middlewares/auth";

// @desc    Login user and get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // generate token
      generateToken(user._id.toString(), res);

      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          studentLevel: user.studentLevel,
          lecturerCourse: user.lecturerCourse,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Private (Admin and Lecturers only)
export const resgisterUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      studentLevel,
      lecturerCourse,
      isActive,
    } = req.body;

    //check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      studentLevel,
      lecturerCourse,
      isActive,
    });
    if (newUser) {
      // Log the registration activity
      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user._id,
          action: "User Registration",
          details: `Registered new user with email: ${newUser.email}`,
        });
      }

      res.status(201).json({
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        studentLevel: newUser.studentLevel,
        lecturerCourse: newUser.lecturerCourse,
        success: true,
        message: "User created successfully",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// @desc    Get User Profile
// @route   GET /api/users/profile
// @access  Private

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      res.json({
        user: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } else {
      res.status(401).json({
        message: "Not authorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

// @desc    Get All Users Profile
// @route   GET /api/users
// @access  Private (Admin)

export const getUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // 1. Parse Query Params safely
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string; // optional: Add search later

    const skip = (page - 1) * limit;

    // 2. Build filter Object
    const filter: any = {};

    if (role && role !== "all" && role !== "") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Fetch Users with Pagination & Filtering
    const [total, users] = await Promise.all([
      User.countDocuments(filter), // Get total count for pagination logic
      User.find(filter)
        .select("-password")
        // .populate("studentLevel", "_id name section") // Added section for context
        // .populate("lecturerCourse", "_id name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    // 4. Send Response
    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
// @desc    Update user (Admin)
// @route   PATCH /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.isActive =
        req.body.isActive !== undefined ? req.body.isActive : user.isActive;
      user.role = req.body.role || user.role;
      user.studentLevel = req.body.studentLevel || user.studentLevel;
      user.lecturerCourse = req.body.lecturerCourse || user.lecturerCourse;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      // const userId = (req as any).user._id;

      // Log the update activity
      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user._id,
          action: "Update User",
          details: `Updated user with email: ${updatedUser.email}`,
        });
      }

      // return updated user
      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        studentLevel: updatedUser.studentLevel,
        lecturerCourse: updatedUser.lecturerCourse,
        message: "User updated Successfully",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      // Log the Delete activity
      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user._id,
          action: "Delete User",
          details: `Deleted user with email: ${user.email}`,
        });
      }

      res.json({
        message: `${user.firstName} ${user.lastName} deleted Successfully`,
      });
    } else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Logout user / clear cookies
// @route   POST /api/users/logout
// @access  Public

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // expire cookie immediately
    });
    res.json({
      message: "logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
