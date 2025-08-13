const mongoose = require("mongoose");

const TaskModel = require("../models/taskModel");

// @desc    Get all tasks for the logged-in user with filtering
// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user with filtering and sorting
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const baseQuery = { user: req.user.id };

    // Extract query params
    const { completed, dueDate, dueBefore, dueAfter, startDate, endDate } =
      req.query;

    // 1️⃣ Completed filter
    if (completed !== undefined) {
      baseQuery.completed = completed === "true";
    }

    // 2️⃣ Exact due date filter
    if (dueDate) {
      const startOfDay = new Date(dueDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dueDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      baseQuery.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // 3️⃣ Before/after filters
    if (dueBefore || dueAfter) {
      baseQuery.dueDate = baseQuery.dueDate || {};
      if (dueAfter) baseQuery.dueDate.$gte = new Date(dueAfter);
      if (dueBefore) baseQuery.dueDate.$lte = new Date(dueBefore);
    }

    // 4️⃣ Start/end date range filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = endOfDay;
    }
    if (Object.keys(dateFilter).length > 0) {
      baseQuery.dueDate = { ...baseQuery.dueDate, ...dateFilter };
    }

    // Sorting
    let mongooseQuery = TaskModel.find(baseQuery);
    if (req.query.sortBy) {
      const [field, order] = req.query.sortBy.split(":");
      mongooseQuery = mongooseQuery.sort({
        [field]: order === "desc" ? -1 : 1,
      });
    } else {
      mongooseQuery = mongooseQuery.sort({ dueDate: 1 }); // default: earliest first
    }

    const tasks = await mongooseQuery;
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: "No task found" });
    }

    // Make sure user is the task owner
    if (task.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, error: "Not authorized to access this task" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const task = await TaskModel.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    let task = await TaskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: "No task found" });
    }

    // Make sure user is the task owner
    if (task.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, error: "Not authorized to update this task" });
    }

    task = await TaskModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findOne({
      _id: req.params.id,
      user: req.user.id, // Ensure the task belongs to the logged-in user
    });

    if (!task) {
      return res.status(404).json({ success: false, error: "No task found" });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get task statistics for the logged-in user
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res, next) => {
  try {
    // --- ADD THIS DEFENSIVE CHECK ---
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, error: "Not authorized, user not found" });
    }
    // --- END OF CHECK ---

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await TaskModel.aggregate([
      // Stage 1: Filter tasks using the validated userId
      {
        $match: { user: userId },
      },

      // Stage 2: Group documents to calculate stats
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: ["$completed", 1, 0] } },
          incompleteTasks: { $sum: { $cond: ["$completed", 0, 1] } },
          soonestDueDate: { $min: "$dueDate" },
          latestDueDate: { $max: "$dueDate" },
        },
      },

      // Stage 3: Format the output
      {
        $project: {
          _id: 0,
          totalTasks: 1,
          completedTasks: 1,
          incompleteTasks: 1,
          soonestDueDate: 1,
          latestDueDate: 1,
          completionRate: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              { $divide: ["$completedTasks", "$totalTasks"] },
            ],
          },
        },
      },
    ]);

    const result =
      stats.length > 0
        ? stats[0]
        : {
            totalTasks: 0,
            completedTasks: 0,
            incompleteTasks: 0,
            soonestDueDate: null,
            latestDueDate: null,
            completionRate: 0,
          };

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    // This log is your best friend for debugging!
    console.error(err);
    res
      .status(400)
      .json({ success: false, error: "Could not retrieve task stats" });
  }
};

//-----------------------------subtasks functions----------------------

exports.createSubTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.taskId);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    task.subTasks.push(req.body);
    await task.save();

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a specific sub-task
// @route   PUT /api/tasks/:taskId/subtasks/:subtaskId
exports.updateSubTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.taskId);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const subTask = task.subTasks.id(req.params.subtaskId);
    if (!subTask) {
      return res
        .status(404)
        .json({ success: false, error: "Sub-task not found" });
    }

    // Update fields
    subTask.set(req.body);
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a specific sub-task
// @route   DELETE /api/tasks/:taskId/subtasks/:subtaskId
exports.deleteSubTask = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.taskId);
    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const subTask = task.subTasks.id(req.params.subtaskId);
    if (!subTask) {
      return res
        .status(404)
        .json({ success: false, error: "Sub-task not found" });
    }

    // subTask.remove();
    // await task.save();

    task.subTasks.pull(req.params.subtaskId);
    await task.save();

    res
      .status(200)
      .json({ success: true, data: { message: "successfully deleted" } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
//------------------------------end-----------------------------
