const mongoose = require('mongoose');

// addition of subtask code 



// --- DEFINE A SUB-TASK SCHEMA ---
const SubTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});
//------------------------------------------------




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







 // --- ADD THIS FIELD ---
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
        index: true
    },
    // ----------------------










    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true // <-- AUTO INDEX ADDED
    },


// ---------------Add sub task code -------to store them into array-------------


// --- ADD THE SUB-TASK ARRAY ---
    subTasks: [SubTaskSchema]






}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Task', TaskSchema);