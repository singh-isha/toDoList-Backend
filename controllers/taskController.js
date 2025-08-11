// const TaskModel = require('../models TaskModel');

// // @desc    Get all tasks    
// // @route   GET /api/tasks
// // @access  Public
// exports.getAllTasks = async (req, res, next) => {
//     try {
//         const tasks = await TaskModel.find();
//         res.status(200).json({ success: true, count: tasks.length, data: tasks });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };

// // @desc    Get single task
// // @route   GET /api/tasks/:id
// // @access  Public
// exports.getTask = async (req, res, next) => {
//     try {
//         const task = await TaskModel.findById(req.params.id);

//         if (!task) {
//             return res.status(404).json({ success: false, error: 'No task found' });
//         }

//         res.status(200).json({ success: true, data: task });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };

// // @desc    Create new task
// // @route   POST /api/tasks
// // @access  Public
// exports.createTask = async (req, res, next) => {
//     try {
//         const task = await TaskModel.create(req.body);
//         res.status(201).json({ success: true, data: task });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };

// // @desc    Update task
// // @route   PUT /api/tasks/:id
// // @access  Public
// exports.updateTask = async (req, res, next) => {
//     try {
//         const task = await TaskModel.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         if (!task) {
//             return res.status(404).json({ success: false, error: 'No task found' });
//         }

//         res.status(200).json({ success: true, data: task });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };

// // @desc    Delete task
// // @route   DELETE /api/tasks/:id
// // @access  Public
// exports.deleteTask = async (req, res, next) => {
//     try {
//         const task = await TaskModel.findByIdAndDelete(req.params.id);

//         if (!task) {
//             return res.status(404).json({ success: false, error: 'No task found' });
//         }

//         res.status(200).json({ success: true, data: {} });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };








const TaskModel = require('../models TaskModel');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// exports.getTasks = async (req, res, next) => {
//     try {
//         // Only find tasks for the logged-in user
//         const tasks = await TaskModel.find({ user: req.user.id });
//         res.status(200).json({ success: true, count: tasks.length, data: tasks });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };





// @desc    Get all tasks for the logged-in user with filtering
// @route   GET /api/tasks
exports.getTasks = async (req, res, next) => {
    try {
        // Base query always filters by the logged-in user
        let query = {
            user: req.user.id
        };

        // --- NEW SEARCH LOGIC ---
        const { dueDate, dueBefore, dueAfter, completed } = req.query;

        // 1. Filtering by completion status
        if (completed) {
            query.completed = completed === 'true';
        }

        // 2. Filtering for tasks due ON a specific day
        if (dueDate) {
            const startOfDay = new Date(dueDate);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(dueDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            query.dueDate = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // 3. Filtering for tasks due BEFORE or AFTER a specific time
        // This can be combined for a date range.
        if (dueBefore || dueAfter) {
            // If query.dueDate doesn't exist, create it
            if (!query.dueDate) {
                query.dueDate = {};
            }
            if (dueAfter) {
                query.dueDate.$gte = new Date(dueAfter);
            }
            if (dueBefore) {
                query.dueDate.$lte = new Date(dueBefore);
            }
        }
        // ------------------------

        const tasks = await TaskModel.find(query).sort({ dueDate: 1 }); // Sort by due date

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        // Added more robust error handling
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
    try {
        const task = await TaskModel.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'No task found' });
        }

        // Make sure user is the task owner
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this task' });
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
            return res.status(404).json({ success: false, error: 'No task found' });
        }

        // Make sure user is the task owner
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this task' });
        }

        task = await TaskModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// exports.deleteTask = async (req, res, next) => {
//     try {
//         const task = await TaskModel.findById(req.params.id);

//         if (!task) {
//             return res.status(404).json({ success: false, error: 'No task found' });
//         }

//         // Make sure user is the task owner
//         if (task.user.toString() !== req.user.id) {
//             return res.status(401).json({ success: false, error: 'Not authorized to delete this task' });
//         }

//         await task.remove();

//         res.status(200).json({ success: true, data: {} });
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };





exports.deleteTask = async (req, res, next) => {
    try {
        const task = await TaskModel.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'No task found' });
        }

        // Make sure user is the task owner
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this task' });
        }

        // ✅ Use deleteOne instead of remove (Mongoose v7+)
        await task.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
