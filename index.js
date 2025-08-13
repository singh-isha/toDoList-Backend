const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const tasks = require("./routes/tasks");
const auth = require("./routes/auth"); // Import auth routes
const { protect } = require("./middleware/auth"); // this one
const router = require("./routes");

//--------------subtask router----------------
//const subtasks = require('./routes/subtasks'); // <-- Import the new router
//------------------------------------------
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.use("/api", router);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
