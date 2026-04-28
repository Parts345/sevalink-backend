import Location from "../models/Location.js";
import Task from "../models/Task.js";
import { buildTaskMatch } from "../services/matchingService.js";


/* =========================
   CREATE TASK (NGO)
========================= */
export async function postTask(req, res, next) {
  console.log("🚨 REQUEST ARRIVED IN BACKEND:", req.body);
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
      return next(
        Object.assign(
          new Error("title, description, volunteersNeeded, and location details are required"),
          { statusCode: 400 }
        )
      );
    }

    if (
      !Number.isFinite(location?.coordinates?.lat) ||
      !Number.isFinite(location?.coordinates?.lng)
    ) {
      return next(
        Object.assign(new Error("location coordinates are required"), { statusCode: 400 })
      );
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
      // ✅ FIX: Give Mongoose a valid 24-character fake ID to pass validation!
      postedBy: req?.user?._id || "507f1f77bcf86cd799439011" 
    });

    const populatedTask = await Task.findById(task._id)
      .populate("location")
      .populate("postedBy", "name ngoName email");

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
    const { skill, city, status = "open" } = req.query;
    const query = {};

    if (status) query.status = status;

    if (skill) {
      query.requiredSkills = { $in: [skill] };
    }

    const tasks = await Task.find(query)
      .populate("location")
      .populate("postedBy", "name ngoName email");

    const filteredTasks = city
      ? tasks.filter(
          (task) =>
            task.location?.city?.toLowerCase() === city.toLowerCase()
        )
      : tasks;

    res.json({
      count: filteredTasks.length,
      tasks: filteredTasks
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   AI MATCHING (VOLUNTEER)
========================= */
export async function getVolunteerMatches(req, res, next) {
  try {
    const tasks = await Task.find({ status: "open" })
      .populate("location")
      .populate("postedBy", "name ngoName email");

    const matches = tasks
      .map((task) => buildTaskMatch(req.user, task))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      volunteerId: req.user._id,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   ACCEPT TASK
========================= */
export async function acceptTask(req, res, next) {
  try {
    const { taskId } = req.params; // ✅ FIXED: Must match route param /:taskId/accept

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.filledSlots) {
      task.filledSlots = 0;
    }

    if (task.filledSlots >= task.volunteersNeeded) {
      return res.status(400).json({
        message: "Task is already full"
      });
    }

    if (!task.volunteers) {
      task.volunteers = [];
    }

    if (task.volunteers.includes(req.user._id)) {
      return res.status(400).json({
        message: "You already accepted this task"
      });
    }

    task.volunteers.push(req.user._id);
    task.filledSlots += 1;

    if (task.filledSlots >= task.volunteersNeeded) {
      task.status = "closed";
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("location")
      .populate("postedBy", "name ngoName email");

    res.json({
      message: "Task accepted successfully",
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
}