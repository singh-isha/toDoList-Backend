const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // --- THIS IS THE CRUCIAL REFERENCE ---
    parentTask: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true,
        index: true // Index for fast lookups
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for ensuring users only see their own subtasks
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subtask', SubtaskSchema);