import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  STUDENT = "student",
  LECTURER = "lecturer",
  ADMIN = "admin",
  PARENT = "parent",
}

export type userRoles = "student" | "lecturer" | "admin" | "parent";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: userRoles;
  isActive: boolean;
  studentLevel?: string | null; // Only for students
  lecturerCourse?: string[] | null; // Only for lecturers
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchmema: Schema<IUser> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.STUDENT,
    },
    isActive: { type: Boolean, default: true },
    studentLevel: { type: mongoose.Schema.Types.ObjectId, ref: "Level" }, // Only for students
    lecturerCourse: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Only for lecturers
  },
  {
    timestamps: true,
  },
);

userSchmema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in the database
userSchmema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchmema);
export default User;
