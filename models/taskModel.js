// const mongoose = require('mongoose');

// const TaskSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: [true, 'Please add a title'],
//         trim: true
//     },
//     description: {
//         type: String,
//         required: false,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// }); 

// module.exports = mongoose.model('Task', TaskSchema);





// const mongoose = require('mongoose');

// const TaskSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: [true, 'Please add a title'],
//         trim: true
//     },
//     description: {
//         type: String,
//         required: false,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     user: { // Add this user field
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true
//     }
// });

// module.exports = mongoose.model('Task', TaskSchema);





const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // --- ADD THIS FIELD ---
    dueDate: {
        type: Date,
        required: false // Not every task needs a due date
    },
    // ----------------------
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);