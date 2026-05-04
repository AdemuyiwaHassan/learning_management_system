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
