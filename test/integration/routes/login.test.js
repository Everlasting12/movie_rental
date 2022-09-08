const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../model/usersModel");
const bcrypt = require("bcrypt");

describe("/api/login", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });
  describe("/ POST", () => {
    it("should return 400 if entered email id is less than 5 characters", async () => {
      const res = await req
        .post("/api/login")
        .send({ email: "sdas", password: "12345678" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if entered email id is more than 255 characters", async () => {
      const email = new Array(266).join("a");
      const res = await req
        .post("/api/login")
        .send({ email, password: "12345678" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if entered email id is in invalid email format", async () => {
      const res = await req
        .post("/api/login")
        .send({ email: "myfakeemaillessthan8", password: "12345678" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if entered password is less than 8 characters", async () => {
      const res = await req
        .post("/api/login")
        .send({ email: "sidhesh@gmail.com", password: "123" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if entered password is more than 1024 characters", async () => {
      const password = new Array(1034).join("a");
      const res = await req
        .post("/api/login")
        .send({ email: "sidhesh@gmail.com", password });
      expect(res.status).toBe(400);
    });

    it("should return 404 if user not found with the given credentials", async () => {
      const user = new User({
        name: "Sidhesh",
        email: "sidheshparab34@gmail.com",
        password: "12345678",
        isAdmin: true,
      });
      await user.save();

      const res = await req
        .post("/api/login/")
        .send({ email: "sidheshparab4@gmail.com", password: "12345678" });
      expect(res.status).toBe(404);
    });

    it("should return 400 with token if user authenticates successfully ", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "Sidhesh",
        email: "sidheshparab34@gmail.com",
        password: "12345678",
        isAdmin: false,
      });
      user.password = await bcrypt.hash("12345678", salt);
      await user.save();
      const token = user.getAuthToken();
      const res = await req.post("/api/login/").send({
        email: "sidheshparab34@gmail.com",
        password: "123456789",
      });
      expect(res.status).toBe(400);
    });

    it("should return 200 with token if user authenticates successfully ", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "Sidhesh",
        email: "sidheshparab34@gmail.com",
        password: "12345678",
        isAdmin: false,
      });
      user.password = await bcrypt.hash("12345678", salt);
      await user.save();
      const token = user.getAuthToken();
      const res = await req.post("/api/login/").send({
        email: "sidheshparab34@gmail.com",
        password: "12345678",
      });
      expect(res.status).toBe(200);
      expect(res.text).toBe(token);
    });
  });
});
