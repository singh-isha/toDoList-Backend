const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const subtaskRouter = require("./subtasks"); // If you want nested subtasks
const router = express.Router();

// 🔹 Protect all routes in this router
router.use(protect);

// 🔹 Stats route — must be above "/:id"
router.get("/stats", getTaskStats);

// 🔹 Nested route for subtasks
router.use("/:taskId/subtasks", subtaskRouter);

// 🔹 Main task routes
router.route("/").get(getTasks).post(createTask);

router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
