// const express = require('express');
// const {
//     getAllTasks,
//     getTask,
//     createTask,
//     updateTask,
//     deleteTask
// } = require('../controller/taskController');

// const router = express.Router();

// router
//     .route('/')
//     .get(getAllTasks) //can get the operations just by writing these 
//     .post(createTask);

// router
//     .route('/:id')
//     .get(getTask)
//     .put(updateTask)
//     .delete(deleteTask);

// module.exports = router;






const express = require('express');
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const router = express.Router();

const { protect } = require('../middleware/auth'); // Import the middleware

router
    .route('/')
    .get(protect, getTasks)       // Protect these routes
    .post(protect, createTask);    // Protect these routes

router
    .route('/:id')
    .get(protect, getTask)        // Protect these routes
    .put(protect, updateTask)     // Protect these routes
    .delete(protect, deleteTask); // Protect these routes

module.exports = router;