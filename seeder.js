// pushing tasks into db
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

// Load env vars
dotenv.config();

// Load models
const TaskModel = require("./models/taskModel"); // this one ??
const UserModel = require("./models/userModel");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    console.log("Fetching users from DB...");
    const users = await UserModel.find();
    if (users.length === 0) {
      console.log(
        "No users found. Please create at least one user before seeding tasks."
      );
      process.exit();
    }

    console.log(`Found ${users.length} users. Generating tasks...`);
    const tasks = [];
    const numTasksToCreate = 200; // Create 200 tasks

    for (let i = 0; i < numTasksToCreate; i++) {
      // Assign a random user to each task
      const randomUser = users[Math.floor(Math.random() * users.length)];

      tasks.push({
        user: randomUser._id,
        title: faker.lorem.sentence(5),
        description: faker.lorem.paragraph(2),
        completed: faker.datatype.boolean(),
        dueDate: faker.date.future(),
      });
    }

    await TaskModel.create(tasks);

    console.log(`Data Imported! ${numTasksToCreate} tasks created.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await TaskModel.deleteMany();
    console.log("Data Destroyed! All tasks deleted.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please use the -i flag to import data or -d to delete data.");
  process.exit();
}
