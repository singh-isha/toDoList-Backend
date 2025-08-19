// const express = require("express");
// const { protect } = require("../middleware/auth");
// const {
//   getTasks,
//   getTask,
//   createTask,
//   updateTask,
//   deleteTask,
//   getTaskStats,
// } = require("../controllers/taskController");

// const subtaskRouter = require("./subtasks"); // If you want nested subtasks
// const router = express.Router();

// // 🔹 Protect all routes in this router
// router.use(protect);

// // 🔹 Stats route — must be above "/:id"
// router.get("/stats", getTaskStats);

// // 🔹 Nested route for subtasks
// router.use("/:taskId/subtasks", subtaskRouter);

// // 🔹 Main task routes
// router.route("/").get(getTasks).post(createTask);

// router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

// module.exports = router;

// for test-cases

const express = require("express");
const {
  // Parent Task Controllers
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,

  // Sub-Task Controllers
  createSubTask,
  updateSubTask,
  deleteSubTask,
} = require("../controllers/taskController"); // Make sure this path is correct

const router = express.Router();
const { protect } = require("../middleware/auth");

// ===================================================================
// Apply the 'protect' middleware to ALL routes defined below in this file.
// This is the key to proper security encapsulation. Any request that
// starts with '/api/tasks' will be required to have a valid token.
// ===================================================================
router.use(protect);

// --- Special Aggregation Route ---
// Placed before routes with parameters like '/:id' to avoid conflicts.
// Handles requests to GET /api/tasks/stats
router.route("/stats").get(getTaskStats);

// --- Parent Task CRUD Routes ---

// Handles requests to GET /api/tasks and POST /api/tasks
router.route("/").get(getTasks).post(createTask);

// Handles requests to GET /api/tasks/:id, PUT /api/tasks/:id, and DELETE /api/tasks/:id
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

// --- Sub-Task CRUD Routes ---

// Handles requests to POST /api/tasks/:taskId/subtasks
router.route("/:taskId/subtasks").post(createSubTask);

// Handles requests to PUT /api/tasks/:taskId/subtasks/:subtaskId and DELETE /api/tasks/:taskId/subtasks/:subtaskId
router
  .route("/:taskId/subtasks/:subtaskId")
  .put(updateSubTask)
  .delete(deleteSubTask);

module.exports = router;
