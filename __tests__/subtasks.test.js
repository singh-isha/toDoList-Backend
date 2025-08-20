const request = require("supertest");
const { app } = require("../index"); // Ensure you are importing 'app' from your main file
const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const SubTask = require("../models/subtaskModel");
const User = require("../models/userModel");

describe("Sub-Tasks API Endpoints", () => {
  let token;
  let parentTaskId;

  beforeAll(async () => {
    // Use a test database for safety
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST, {
        dbName: "todo-api-test",
      });
    }

    // Clean collections before starting the test suite
    await User.deleteMany({});
    await Task.deleteMany({});
    await SubTask.deleteMany({});

    // Register and login a test user once for all tests
    const userRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "SubTask Test User",
        email: "subtasktest@example.com",
        password: "password123",
      });
    token = userRes.body.token;

    // Create a parent task for the user once for all tests
    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Parent Task for Sub-task tests" });
    parentTaskId = taskRes.body.data._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new sub-task for an authenticated user on their own task", async () => {
    const res = await request(app)
      .post(`/api/tasks/${parentTaskId}/subtasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My first sub-task" });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My first sub-task");
    expect(res.body.data.parentTask.toString()).toBe(parentTaskId.toString());

    // Check that the subtask was correctly added to the parent task's subtasks array
    const parentTask = await Task.findById(parentTaskId);
    expect(parentTask.subtasks).toHaveLength(1);
    expect(parentTask.subtasks[0].toString()).toBe(res.body.data._id);
  });

  it("should fail to create a sub-task on a task owned by another user", async () => {
    // Create another user and their task
    const otherUserRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Other User",
        email: "other@example.com",
        password: "password123",
      });
    const otherToken = otherUserRes.body.token;
    const otherTaskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Other User's Task" });
    const otherTaskId = otherTaskRes.body.data._id;

    // Now, try to create a subtask on the other user's task with the current user's token
    const res = await request(app)
      .post(`/api/tasks/${otherTaskId}/subtasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "This should fail" });

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Parent task not found");
  });

  it("should update an existing sub-task", async () => {
    // Create a subtask to update
    const subTaskRes = await request(app)
      .post(`/api/tasks/${parentTaskId}/subtasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Update me!" });
    const subTaskId = subTaskRes.body.data._id;

    const res = await request(app)
      .put(`/api/tasks/${parentTaskId}/subtasks/${subTaskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "I have been updated!", completed: true });

    // The controller now returns only the updated subtask
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("I have been updated!");
    expect(res.body.data.completed).toBe(true);
  });

  it("should delete an existing sub-task", async () => {
    // Create a subtask to delete
    const subTaskRes = await request(app)
      .post(`/api/tasks/${parentTaskId}/subtasks`)
      .set("Authorization", ` Bearer ${token}`)
      .send({ title: "Delete me!" });
    const subTaskId = subTaskRes.body.data._id;

    const res = await request(app)
      .delete(`/api/tasks/${parentTaskId}/subtasks/${subTaskId}`)
      .set("Authorization", `Bearer ${token}`);

    // The controller now returns an empty object on successful deletion
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Object.keys(res.body.data).length).toBe(0);

    // Verify the subtask is gone from both collections
    const deletedSubTask = await SubTask.findById(subTaskId);
    expect(deletedSubTask).toBeNull();

    const parentTask = await Task.findById(parentTaskId);
    expect(parentTask.subtasks).not.toContain(subTaskId);
  });
});
