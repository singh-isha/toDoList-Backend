// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');

// // Load env vars
// dotenv.config();

// // Connect to database
// connectDB();

// // Route files
// const tasks = require('./routes/tasks');

// const app = express();

// // Body parser
// app.use(express.json());

// // Mount routers
// app.use('/api/tasks', tasks); 

// const PORT = process.env.PORT || 5000;

// const server = app.listen(
//     PORT,
//     console.log(`Server running in on port ${PORT}`)
// );

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//     console.log(`Error: ${err.message}`);
//     // Close server & exit process
//     server.close(() => process.exit(1));
// });








const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const tasks = require('./routes/tasks');
const auth = require('./routes/auth'); // Import auth routes

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/tasks', tasks);
app.use('/api/auth', auth); // Mount auth routes

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});


