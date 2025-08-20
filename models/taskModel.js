const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true, // <-- AUTO INDEX ADDED
    },
    dueDate: {
      type: Date,
      required: false,
      index: true, // <-- AUTO INDEX ADDED
    },

    // --- ADD THIS FIELD ---
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },
    // ----------------------

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      index: true, // <-- AUTO INDEX ADDED
    },

    // --- THIS IS THE KEY CHANGE AFTER ADDITION OF AUTO INDEXING ---
    // Remove the embedded array: subTasks: [SubTaskSchema]
    // And replace it with an array of ObjectIds
    subtasks: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Subtask",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Task", TaskSchema);
