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
const router = require("./routes"); //default index.js

//--------------subtask router----------------
//const subtasks = require('./routes/subtasks'); // <-- Import the new router
//------------------------------------------
const app = express();

// Body parser
app.use(express.json()); //explain

// Cookie parser
app.use(cookieParser()); //explain

app.use("/api", router);
const PORT = process.env.PORT || 5000;

// Only start the server if not in a test environment
let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, console.log(`Server running on port ${PORT}`));
}

//const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

//for superset test

module.exports = { server, app };
