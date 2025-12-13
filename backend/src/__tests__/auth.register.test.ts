const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("POST /api/v1/auth/register", () => {
  beforeAll(async () => {
    // Connect to a test database or use a mock
    await mongoose.connect(process.env.MONGODB_URI || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: `testuser_${Date.now()}@example.com`,
        password: "TestPassword123!",
        firstName: "Test",
        lastName: "User",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toContain("testuser_");
  });

  it("should not register with an existing email", async () => {
    const email = `testuser_${Date.now()}@example.com`;
    await request(app).post("/api/v1/auth/register").send({
      email,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
    });
    const res = await request(app).post("/api/v1/auth/register").send({
      email,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });
});
