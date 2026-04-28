import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    availability: {
      type: [String],
      default: []
    },
    volunteersNeeded: {
      type: Number,
      required: true,
      min: 1
    },
    filledSlots: {
      type: Number,
      default: 0,
      min: 0
    },
    // ✅ ADDED missing volunteers array
    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["open", "filled", "closed"],
      default: "open"
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;