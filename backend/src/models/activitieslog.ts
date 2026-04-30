import mongoose, { Schema, Document } from "mongoose";

interface IActivityLog extends Document {
  user: string; // who did the activity
  action: string; // "Created Exam", "Registered Student" was performed
  details?: string; // optional additional info about the activity
  createdAt: Date; // when the activity occurred
}

const activitiesLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    details: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IActivityLog>(
  "ActivitiesLog",
  activitiesLogSchema,
);
