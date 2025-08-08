Node.js & MongoDB To-Do List API
A robust and secure RESTful backend API for a To-Do list application, built with Node.js, Express, and MongoDB. It features complete user authentication using JSON Web Tokens (JWT) and advanced task management capabilities.

Features
Secure User Authentication: Full user Sign Up & Sign In functionality with password hashing (bcryptjs) and JWT authentication.
Protected Routes: Endpoints are protected, ensuring users can only access and manage their own tasks.
Full CRUD for Tasks: Complete Create, Read, Update, and Delete operations for to-do tasks.
Task Management:
Mark tasks as complete or incomplete.
Assign tasks with a specific due date and time.
Advanced Task Searching & Filtering:
Filter tasks by their completion status (?completed=true).
Find tasks due on a specific day (?dueDate=YYYY-MM-DD).
Find tasks due before or after a specific timestamp.
Search for tasks within a precise time window (e.g., between 2 PM and 3 PM).
Tech Stack
Node.js: JavaScript runtime environment
Express: Web framework for Node.js
MongoDB: NoSQL database for data storage
Mongoose: Object Data Modeling (ODM) library for MongoDB
JSON Web Tokens (JWT): For secure user authentication
bcryptjs: For hashing user passwords
dotenv: For managing environment variables
API Endpoints
The base URL for all endpoints is /api.
Authentication
Method	Endpoint	Description	Access
POST	/auth/signup	Creates a new user account.	Public
POST	/auth/signin	Signs in a user and returns a JWT.	Public
Tasks
All task routes are protected and require a Bearer Token in the Authorization header.
Method	Endpoint	Description	Access
POST	/tasks	Creates a new task for the logged-in user.	Protected
GET	/tasks	Gets all tasks for the logged-in user. <br> Supports filtering via ?completed, ?dueDate, ?dueAfter, ?dueBefore.	Protected
GET	/tasks/:id	Gets a single task by its ID.	Protected
PUT	/tasks/:id	Updates an existing task (e.g., to mark as complete or change its due date).	Protected
DELETE	/tasks/:id	Deletes a task by its ID.	Protected
Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.
Prerequisites
Node.js installed
MongoDB installed locally or a MongoDB Atlas account
Installation
Clone the repository:
code
Sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
Install NPM packages:
code
Sh
npm install
Create a .env file in the root directory and add the following environment variables:
code
Env
# --- .env example ---
PORT=5000

# Your MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/yourDatabaseName

# A long, random, and secret string for signing JWTs
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
Run the server:
code
Sh
npm run dev
The API will be available at http://localhost:5000.
License
This project is licensed under the MIT License - see the LICENSE.md file for details.
