import { type Request, type Response } from "express";
import { Types } from "mongoose";
import Level from "../models/level.ts";
import { logActivity } from "../utils/activitieslog.ts";

// @desc    Create a new Level
// @route   POST /api/levels
// @access  Private/Admin
export const createLevel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, academicYear, classAdvisor, capacity } = req.body;

    const existingLevel = await Level.findOne({ name, academicYear });
    if (existingLevel) {
      res
        .status(400)
        .json({ message: "Level already exists for this academic year" });
      return;
    }

    const newLevel = await Level.create({
      name,
      academicYear,
      classAdvisor,
      capacity,
    });

    await logActivity({
      userId: (req as any).user._id,
      action: `Created ${name} for new academic year ${academicYear}`,
    });
    res.status(201).json(newLevel);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all Levels (Paginated & Searchable)
// @route   GET /api/levels
// @access  Private/Admin
export const getAllLevels = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = {};

    if (search) {
      query.name = { $regex: (search as string).trim(), $options: "i" };
    }

    const levels = await Level.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Level.countDocuments(query);

    res.status(200).json({
      success: true,
      data: levels,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Update level details
// @route  PUT /api/levels/:id
// @access Private/Admin
export const updateLevel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (
      typeof req.params.id !== "string" ||
      !Types.ObjectId.isValid(req.params.id)
    ) {
      res.status(400).json({ message: "Invalid Level ID" });
      return;
    }

    const levelId = req.params.id;
    const { name, academicYear } = req.body;
    // const level = await Level.findById(levelId);
    const existingLevel = await Level.findOne({
      _id: { $ne: levelId },
      name,
      academicYear,
    });
    if (existingLevel) {
      res
        .status(400)
        .json({ message: "Level already exists for this academic year " });
      return;
    }

    const updatedLevel = await Level.findByIdAndUpdate(
      levelId,
      { name, academicYear },
      { new: true, runValidators: true },
    );

    await logActivity({
      userId: (req as any).user._id,
      action: `Updated level: ${updatedLevel?.name}`,
    });

    res.status(200).json(updatedLevel);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
