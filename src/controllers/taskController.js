import Location from "../models/Location.js";
import Task from "../models/Task.js";
import { buildTaskMatch } from "../services/matchingService.js";

/* =========================
   CREATE TASK (NGO)
========================= */
export async function postTask(req, res, next) {
  try {
    const {
      title,
      description,
      requiredSkills = [],
      availability = [],
      volunteersNeeded,
      urgency = "medium",
      location
    } = req.body;

    if (!title || !description || !volunteersNeeded || !location?.label || !location?.city) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const savedLocation = await Location.create(location);

    const task = await Task.create({
      title,
      description,
      requiredSkills,
      availability,
      volunteersNeeded,
      urgency,
      location: savedLocation._id,
      postedBy: "507f1f77bcf86cd799439011" // demo user
    });

    const populatedTask = await Task.findById(task._id)
      .populate("location")
      .populate("postedBy");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   FETCH TASKS
========================= */
export async function fetchTasks(req, res, next) {
  try {
    const tasks = await Task.find({ status: "open" })
      .populate("location")
      .populate("postedBy");

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   MATCHING (OPTIONAL)
========================= */
export async function getVolunteerMatches(req, res, next) {
  try {
    const tasks = await Task.find({ status: "open" })
      .populate("location")
      .populate("postedBy");

    const matches = tasks.map((task) => ({
      ...task.toObject(),
      matchScore: 80 // demo value
    }));

    res.json({
      matches
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   ACCEPT TASK (FIXED)
========================= */
export async function acceptTask(req, res, next) {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.volunteers) task.volunteers = [];
    if (!task.filledSlots) task.filledSlots = 0;

    // 🔥 DEMO USER (NO AUTH REQUIRED)
    const userId = "507f1f77bcf86cd799439012";

    if (task.volunteers.includes(userId)) {
      return res.status(400).json({
        message: "Already accepted"
      });
    }

    if (task.filledSlots >= task.volunteersNeeded) {
      return res.status(400).json({
        message: "Task full"
      });
    }

    task.volunteers.push(userId);
    task.filledSlots += 1;

    if (task.filledSlots >= task.volunteersNeeded) {
      task.status = "closed";
    }

    await task.save();

    res.json({
      message: "Task accepted successfully",
      task
    });
  } catch (error) {
    next(error);
  }
}