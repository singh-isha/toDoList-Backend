const request = require("supertest");
const { app } = require("../index"); // Import app + server
const mongoose = require("mongoose");
const User = require("../models/userModel");

describe("Auth API Endpoints", () => {
  beforeAll(async () => {
    // Ensure mongoose is connected before touching the DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "todo-api-test", // dedicated test DB
      });
    }

    // Clean only the users collection instead of dropping DB
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    //await server.close(); // Close the HTTP server to avoid Jest open handles
  });

  it("should signup a new user successfully", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail to signup a user with a duplicate email", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Another User",
      email: "test@example.com", // duplicate email
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body.error).toEqual("That email is already registered");
  });

  it("should log in an existing user successfully", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
  });
});
