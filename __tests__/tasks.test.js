const request = require("supertest");
const { app } = require("../index"); // Import app ( you do not need to import server here , it will work without its import)
const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const User = require("../models/userModel");

describe("Tasks API Endpoints", () => {
  let token;

  beforeAll(async () => {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "todo-api-test",
      });
    }

    // Clean collections before each run
    await User.deleteMany({});
    await Task.deleteMany({});

    // Register a test user
    await request(app).post("/api/auth/signup").send({
      name: "Task Test User",
      email: "tasktest@example.com",
      password: "password123",
    });

    // Log in to get the token
    const res = await request(app)
      .post("/api/auth/signin") // <-- make sure matches your routes
      .send({
        email: "tasktest@example.com",
        password: "password123",
      });

    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    // await server.close(); // Close HTTP server 224, do not do this it will close the server
  });

  it("should create a new task for an authenticated user", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task from Jest",
        priority: "High",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test Task from Jest");
  });

  it("should fail to create a task if not authenticated", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "This should fail",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should get all tasks for the authenticated user", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(1); // We only created one task so far
  });
});
