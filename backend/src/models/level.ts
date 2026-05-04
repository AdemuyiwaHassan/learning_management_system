import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript to know the structure
export interface ILevel extends Document {
  name: string; // e.g., "Grade 10"
  academicYear: mongoose.Types.ObjectId; // Link to "2024-2025"
  classAdvisor: mongoose.Types.ObjectId; // The main teacher in charge
  subjects: mongoose.Types.ObjectId[]; // List of subjects taught in this class
  students: mongoose.Types.ObjectId[]; // List of students enrolled
  capacity: number; // Max students allowed (optional)
}

const levelSchema = new Schema<ILevel>(
  {
    name: {
      type: String,
      required: [true, "Level name is required"],
      trim: true,
    },
    // Reference to the Academic Year model
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    // Reference to the User model (Teacher role)
    classAdvisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Array of References to Subject model
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    // Array of References to User model (Student role)
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    capacity: {
      type: Number,
      default: 40,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// Compound Index: Prevents creating duplicate levels
// (e.g., You can't have two "Grade 10" in the same Academic Year)
levelSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<ILevel>("Level", levelSchema);
