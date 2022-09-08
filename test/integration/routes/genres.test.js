const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const req = supertest(app);
const { Genre } = require("../../../model/genresModel");
const { User } = require("../../../model/usersModel");

describe("/api/genres", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });

  describe("/ GET", () => {
    it("should return 404 if could not found any genres", async () => {
      const res = await req.get("/api/genres/");
      expect(res.status).toBe(404);
    });

    it("should return 200 with all the genres from the database", async () => {
      const genre1 = new Genre({ name: "Thriller" });
      await genre1.save();

      const genre2 = new Genre({ name: "Action" });
      await genre2.save();

      const res = await req.get("/api/genres/");

      expect(res.status).toBe(200);
      expect(res.body.some((g) => g.name === "Action")).toBeTruthy();
      expect(res.body.some((g) => g.name === "Thriller")).toBeTruthy();
    });
  });

  describe("/:id GET", () => {
    it("should return 400 if ID is invalid", async () => {
      const res = await req.get("/api/genres/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if could not found any genres", async () => {
      const id = new mongoose.Types.ObjectId(1);
      const res = await req.get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });

    it("should return a genre with 200 status code", async () => {
      const genre = new Genre({
        name: "genre1",
      });
      await genre.save();
      const res = await req.get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await req.post("/api/genres");
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre name is less than 3 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "g1" });

      expect(res.status).toBe(400);
    });

    // for more than 50 length
    it("should return 400 if genre name is more than 50 characters", async () => {
      const token = new User().getAuthToken();
      const name = new Array(52).join("a");
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name,
        });

      expect(res.status).toBe(400);
    });

    // actual post

    it("should return 404 genre with same name already exists", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });

      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: "Drama",
        });
      const genre = await Genre.findOne({ name: "Drama" });
      expect(res.status).toBe(404);
      expect(genre).not.toBeNull();
    });

    it("should save the genre if genre with same name does not exists and status code should be 200 with returning the saved genre", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: "genre3",
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre3");
    });
  });

  describe("/:id PUT", () => {
    it("should return 401 if no token is provided", async () => {
      const token = "";
      const res = await req.put("/api/genres/" + 1).set("x-auth-token", token);
      expect(res.status).toBe(401);
    });

    it("should return 400 if ID is invalid", async () => {
      const token = new User().getAuthToken();
      const res = await req.put("/api/genres/" + 1).set("x-auth-token", token);

      expect(res.status).toBe(400);
    });
    //
    it("should return 400 if name is less than 3 characters", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId(1);
      const res = await req
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: "g1" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      const id = new mongoose.Types.ObjectId(1);
      const token = new User().getAuthToken();
      const name = new Array(52).join("s");
      const res = await req
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name });

      expect(res.status).toBe(400);
    });

    it("should return 404 if could not found genre with given ID", async () => {
      const id = new mongoose.Types.ObjectId(12);
      const token = new User().getAuthToken();
      await Genre.collection.insertMany([
        { name: "Drama" },
        { name: "Action" },
        { name: "Romatic" },
      ]);

      const res = await req
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: "Science Fiction" });

      expect(res.status).toBe(404);
    });

    it("should receive 200 if Genre is updated with the given ID", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({ name: "Romantic" });
      await genre.save();

      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "Science Fiction" });

      expect(res.status).toBe(200);
    });
  });

  describe("/:id DELETE", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await req.delete("/api/genres/" + 1);
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/genres/" + 1)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if ID is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .delete("/api/genres/" + 12)
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId(23);

      await Genre.collection.insertMany([
        { name: "Drama" },
        { name: "Romantic" },
      ]);

      const res = await req
        .delete("/api/genres/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 200 if genre with given id is deleted", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const genre = new Genre({ name: "Horror" });
      await genre.save();

      const res = await req
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
    });
  });
});
