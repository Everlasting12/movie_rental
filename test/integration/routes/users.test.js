const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../model/usersModel");

describe("/api/users/", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("/ GET", () => {
    it("should return 400 if users not found", async () => {
      const res = await req.get("/api/users/");
      expect(res.status).toBe(404);
    });
    it("should return 200 if found users", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "Sidhesh",
        email: "sidheshparab34@gmail.com",
        password: "12345678",
      });
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();

      const res = await req.get("/api/users/");
      expect(res.status).toBe(200);
      expect(res.body.some((g) => g.name === "Sidhesh")).toBeTruthy();
      expect(res.body.some((g) => g.isAdmin === false)).toBeTruthy();
    });
  });

  describe("/:id GET", () => {
    it("should return 400 if id is invalid ObjectID", async () => {
      const res = await req.get("/api/users/" + 32);
      expect(res.status).toBe(400);
    });

    it("should return 404 if user could not be found with the given id", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await req.get("/api/users/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 if user found", async () => {
      const user = new User({
        name: "Sidhesh",
        email: "mahit235nahi@gmail.com",
        password: await bcrypt.hash("12345678", await bcrypt.genSalt(10)),
        isAdmin: true,
      });
      await user.save();

      const res = await req.get("/api/users/" + user._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Sidhesh");
      expect(res.body).toHaveProperty("email", user.email);
      expect(res.body).toHaveProperty("isAdmin", true);
      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("/ POST", () => {
    //   name
    it("should return 404 if name is less than 5 characters", async () => {
      const res = await req.post("/api/users/").send({ name: "ss" });
      expect(res.status).toBe(404);
    });

    it("should return 404 if name is more than 50 characters", async () => {
      const name = new Array(55).join("a");
      const res = await req.post("/api/users/").send({ name });
      expect(res.status).toBe(404);
    });
    //   email
    it("should return 404 if email is less than 5 characters", async () => {
      const res = await req
        .post("/api/users/")
        .send({ name: "Sidhesh", email: "sss" });
      expect(res.status).toBe(404);
    });

    it("should return 404 if email is more than 255 characters", async () => {
      const email = new Array(265).join("a");
      const res = await req
        .post("/api/users/")
        .send({ name: "Sidhesh", email });
      expect(res.status).toBe(404);
    });

    it("should return 404 if email is not in valid emailformat", async () => {
      const res = await req
        .post("/api/users/")
        .send({ name: "Sidhesh", email: "asdkjskdfh" });
      expect(res.status).toBe(404);
    });

    //   password
    it("should return 404 if password is less than 8 characters", async () => {
      const res = await req.post("/api/users/").send({
        name: "Sidhesh",
        email: "sidheshpa@gmail.com",
        password: "sasdss",
      });
      expect(res.status).toBe(404);
    });

    it("should return 404 if password is more than 1024 characters", async () => {
      const password = new Array(1045).join("a");
      const res = await req
        .post("/api/users/")
        .send({ name: "Sidhesh", email: "sidheshpa@gmail.com", password });
      expect(res.status).toBe(404);
    });

    it("should return 400 if user with the same email already exists", async () => {
      await User.collection.insertOne({
        name: "Akshay",
        email: "akshay34@gmail.com",
        password: "123456789",
        isAdmin: true,
      });

      const res = await req.post("/api/users/").send({
        name: "Sidhesh",
        email: "akshay34@gmail.com",
        password: "myFakePassword",
      });

      expect(res.status).toBe(400);
    });

    it("should return 200 if user registered successfully", async () => {
      const res = await req.post("/api/users/").send({
        name: "Sidhesh",
        email: "sidheshparab34@gmail.com",
        password: "123456709",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Sidhesh");
      expect(res.body).toHaveProperty("email", "sidheshparab34@gmail.com");
      expect(res.body).toHaveProperty("isAdmin", false);
      expect(res.body).not.toHaveProperty("password");
    });
  });
  describe("/:id PUT", () => {
    it("should return 401 if token not provided", async () => {
      const res = await req.put("/api/users/" + 23);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await req
        .put("/api/users/" + 23)
        .set("x-auth-token", "myfaketoken");
      expect(res.status).toBe(400);
    });

    it("should return 400 if id is invalid ObjectID", async () => {
      const token = new User().getAuthToken();
      const res = await req.put("/api/users/" + 23).set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is less than 5 characters", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({ name: "ss" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const name = new Array(55).join("a");
      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({ name });
      expect(res.status).toBe(400);
    });
    //   email
    it("should return 400 if email is less than 5 characters", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({ name: "Sidhesh", email: "sss" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 255 characters", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const email = new Array(265).join("a");
      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({ name: "Sidhesh", email });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is not in valid emailformat", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({ name: "Sidhesh", email: "asdkjskdfh" });
      expect(res.status).toBe(400);
    });

    //   password
    it("should return 400 if password is less than 8 characters", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({
          name: "Sidhesh",
          email: "sidheshpa@gmail.com",
          password: "sasdss",
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if password is more than 1024 characters", async () => {
      const user = new User({
        name: "Shubham",
        email: "shubhammangore@gmail.com",
        password: "1234567890",
        isAdmin: false,
      });

      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10)
      );

      await user.save();

      const password = new Array(1045).join("a");
      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({ name: "Sidhesh", email: "sidheshpa@gmail.com", password });
      expect(res.status).toBe(400);
    });

    it("should return 404 if user could not be found with given id", async () => {
      const fakeId = mongoose.Types.ObjectId();
      const token = new User().getAuthToken();
      const res = await req
        .put("/api/users/" + fakeId)
        .set("x-auth-token", token)
        .send({
          name: "Sidhesh",
          email: "sidheshp@gmail.com",
          password: "123456789",
        });
      expect(res.status).toBe(404);
    });

    it("should return 200 if user is updated", async () => {
      const user = new User({
        name: "Sidhesh",
        email: "sidheshp@gmail.com",
        password: await bcrypt.hash("123456789", await bcrypt.genSalt(10)),
      });
      await user.save();

      const res = await req
        .put("/api/users/" + user._id)
        .set("x-auth-token", user.getAuthToken())
        .send({
          name: "Akshay",
          email: "akshay@gmail.com",
          password: "123456789",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Akshay");
      expect(res.body).toHaveProperty("email", "akshay@gmail.com");
      expect(res.body).toHaveProperty("isAdmin", false);
      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("/:id DELETE", () => {
    it("should return 401 if token not provided", async () => {
      const res = await req.delete("/api/users/" + 234);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await req
        .delete("/api/users/" + 234)
        .set("x-auth-token", "myfaketoken");
      expect(res.status).toBe(400);
    });

    it("should return 400 if id is invalid ObjectID", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/users/" + 234)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if user with given id is not found ", async () => {
      const token = new User().getAuthToken();
      const fakeId = mongoose.Types.ObjectId();
      const res = await req
        .delete("/api/users/" + fakeId)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 200 if user with given id is not found ", async () => {
      const user = new User({
        name: "Sidhesh",
        email: "sidheshp@gmail.com",
        password: await bcrypt.hash("123456789", await bcrypt.genSalt(10)),
      });

      await user.save();

      const token = new User().getAuthToken();

      const res = await req
        .delete("/api/users/" + user._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
