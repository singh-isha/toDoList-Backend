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
        default: false,
        index: true // <-- AUTO INDEX ADDED
    },
    dueDate: {
        type: Date,
        required: false,
        index: true // <-- AUTO INDEX ADDED
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true // <-- AUTO INDEX ADDED
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Task', TaskSchema);