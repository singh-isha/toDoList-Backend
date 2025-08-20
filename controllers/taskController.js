const mongoose = require("mongoose");
const SubTask = require("../models/subtaskModel");
const TaskModel = require("../models/taskModel");

// ==========================================================
// ==                PARENT TASK CONTROLLERS               ==
// ==========================================================

// @desc    Get all tasks for the logged-in user with filtering and sorting
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const baseQuery = { user: req.user.id };
    const {
      completed,
      dueDate,
      dueBefore,
      dueAfter,
      startDate,
      endDate,
      sortBy,
    } = req.query;

    if (completed !== undefined) {
      baseQuery.completed = completed === "true";
    }
    if (dueDate) {
      const startOfDay = new Date(dueDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dueDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      baseQuery.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (dueBefore || dueAfter) {
      baseQuery.dueDate = baseQuery.dueDate || {};
      if (dueAfter) baseQuery.dueDate.$gte = new Date(dueAfter);
      if (dueBefore) baseQuery.dueDate.$lte = new Date(dueBefore);
    }
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
    let mongooseQuery = TaskModel.find(baseQuery);
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      mongooseQuery = mongooseQuery.sort({
        [field]: order === "desc" ? -1 : 1,
      });
    } else {
      mongooseQuery = mongooseQuery.sort({ dueDate: 1 });
    }

    const tasks = await mongooseQuery;
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single task WITH its sub-tasks
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const taskId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const task = await TaskModel.aggregate([
      { $match: { _id: taskId, user: userId } },
      {
        $lookup: {
          from: "subtasks",
          localField: "subtasks", // Fixed name
          foreignField: "parentTask", // This should be parentTask as per your subtaskModel
          as: "subtasks", // Fixed name
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          completed: 1,
          priority: 1,
          user: 1,
          createdAt: 1,
          updatedAt: 1,
          subtasks: 1,
        },
      },
    ]);

    if (!task || task.length === 0) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.status(200).json({ success: true, data: task[0] });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const task = await TaskModel.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await TaskModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete task AND all its subtasks
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await TaskModel.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!task) {
      return res.status(404).json({ success: false, error: "No task found" });
    }

    await SubTask.deleteMany({ parentTask: task._id });
    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get task statistics for the logged-in user
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await TaskModel.aggregate([
      { $match: { user: userId } },
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
    console.error(err);
    res
      .status(400)
      .json({ success: false, error: "Could not retrieve task stats" });
  }
};

// ==========================================================
// ==                 SUB-TASK CONTROLLERS                 ==
// ==========================================================

// @desc    Add a sub-task
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
exports.createSubTask = async (req, res) => {
  try {
    const parentTask = await TaskModel.findById(req.params.taskId);
    if (!parentTask || parentTask.user.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, error: "Parent task not found" });
    }

    const newSubTask = await SubTask.create({
      ...req.body,
      parentTask: req.params.taskId,
      user: req.user.id,
    });

    parentTask.subtasks.push(newSubTask._id);
    await parentTask.save();

    res.status(201).json({ success: true, data: newSubTask });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a specific sub-task
// @route   PUT /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
exports.updateSubTask = async (req, res) => {
  try {
    const subTask = await SubTask.findOneAndUpdate(
      {
        _id: req.params.subtaskId,
        user: req.user.id,
        parentTask: req.params.taskId,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subTask) {
      return res
        .status(404)
        .json({ success: false, error: "Sub-task not found" });
    }
    res.status(200).json({ success: true, data: subTask });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a specific sub-task
// @route   DELETE /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
exports.deleteSubTask = async (req, res) => {
  try {
    const subTask = await SubTask.findOne({
      _id: req.params.subtaskId,
      user: req.user.id,
      parentTask: req.params.taskId,
    });
    if (!subTask) {
      return res
        .status(404)
        .json({ success: false, error: "Sub-task not found" });
    }

    // Use deleteOne() instead of the deprecated remove()
    await subTask.deleteOne();

    await TaskModel.findByIdAndUpdate(req.params.taskId, {
      $pull: { subtasks: req.params.subtaskId },
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
