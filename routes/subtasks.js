// routes/subtasks.js
const express = require("express");
const {
  createSubTask,
  updateSubTask,
  deleteSubTask,
} = require("../controllers/taskController"); // Or use subtaskController if you separate logic

const { protect } = require("../middleware/auth");

const router = express.Router({ mergeParams: true }); // mergeParams lets you access req.params.taskId

// Protect all routes here
router.use(protect);

// Create a new subtask for a specific task
router.route("/").post(createSubTask);

// Update or delete a specific subtask
router.route("/:subtaskId").put(updateSubTask).delete(deleteSubTask);

module.exports = router;
