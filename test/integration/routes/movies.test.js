const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { Genre } = require("../../../model/genresModel");
const { Movie } = require("../../../model/movieModel");
const { User } = require("../../../model/usersModel");

describe("/api/movies", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
    await Movie.deleteMany({});
  });

  describe("/ GET", () => {
    it("should return 200 if movies are found", async () => {
      await Movie.collection.insertMany([
        {
          title: "Gabbar Singh",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { name: "Action" },
          liked: false,
        },
        {
          title: "Inception",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genre: { name: "Thriller" },
          liked: true,
        },
      ]);

      const res = await req.get("/api/movies/");
      expect(res.status).toBe(200);
      expect(res.body.some((m) => m.title === "Gabbar Singh")).toBeTruthy();
      expect(res.body.some((m) => m.dailyRentalRate === 23)).toBeTruthy();
      expect(res.body.some((m) => m.numberInStocks === 34)).toBeTruthy();
      expect(res.body.some((m) => m.liked === false)).toBeTruthy();
      expect(res.body.some((m) => m.genre.name === "Action")).toBeTruthy();
    });
    it("should return 404 if movies not found", async () => {
      const res = await req.get("/api/movies/");
      expect(res.status).toBe(404);
    });
  });

  describe("/:id GET", () => {
    it("should return 400 if given id is invalid", async () => {
      const res = await req.get("/api/movies/" + 12);
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie with the given id is not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/movies/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 if the movie with the given id is found", async () => {
      await Movie.collection.insertMany([
        {
          title: "Gabbar Singh",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { name: "Action" },
          liked: false,
        },
        {
          title: "Inception",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genre: { name: "Thriller" },
          liked: true,
        },
      ]);
      const movie = await Movie.findOne({ title: "Gabbar Singh" });

      const res = await req.get("/api/movies/" + movie._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("genre");
      expect(res.body).toHaveProperty("title", "Gabbar Singh");
      expect(res.body).toHaveProperty("dailyRentalRate", 23);
      expect(res.body).toHaveProperty("numberInStocks", 34);
      expect(res.body.genre).toHaveProperty("_id");
      expect(res.body.genre).toHaveProperty("name", "Action");
      expect(res.body).toHaveProperty("liked", false);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if token is invalid", async () => {
      const res = await req.post("/api/movies/").send({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 34,
        genre: { name: "Action" },
        liked: false,
      });
      expect(res.status).toBe(401);
    });
    // movie.title
    it("should return 400 if title is less than 5 characters", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "ngh",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if title is more than 50 characters", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });
      const title = new Array(56).join("a");

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title,
          dailyRentalRate: 23,
          numberInStocks: 34,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });
    // movie.dailyRentalRate
    it("should return 400 if dailyRentalRate is less than 10", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "Golmal",
          dailyRentalRate: 9,
          numberInStocks: 34,
          genreId: genre._id.toString(),
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is more than 100 ", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 230,
          numberInStocks: 34,
          genreId: genre._id.toString(),
          liked: false,
        });

      expect(res.status).toBe(400);
    });
    // movie.numberInStocks
    it("should return 400 if numberInStocks is less than 0", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 20,
          numberInStocks: -1,
          genreId: genre._id.toString(),
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStocks is more than 50", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 20,
          numberInStocks: 51,
          genreId: genre._id.toString(),
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if genreId is not a valid ObjectID", async () => {
      const token = new User().getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 20,
          numberInStocks: 51,
          // genreId: genre._id.toString(),
          genreId: "genre._id.toString()",
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given id is not found", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId();
      // await Genre.collection.insertOne({ name: "Horror" });

      // const genre = await Genre.findOne({ name: "Horror" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "Gabbar Singh",
          dailyRentalRate: 34,
          numberInStocks: 34,
          genreId: id,
        });

      expect(res.status).toBe(404);
    });

    it("should return 200 if genre found and movie is saved", async () => {
      const token = new User().getAuthToken();
      await Genre.collection.insertOne({ name: "Horror" });

      const genre = await Genre.findOne({ name: "Horror" });

      const res = await req
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({
          title: "Gabbar Singh",
          dailyRentalRate: 34,
          numberInStocks: 34,
          genreId: genre._id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "Gabbar Singh");
      expect(res.body).toHaveProperty("dailyRentalRate", 34);
      expect(res.body).toHaveProperty("numberInStocks", 34);
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre).toHaveProperty("_id");
      expect(res.body.genre).toHaveProperty("name", "Horror");
      expect(res.body).toHaveProperty("liked");
    });
  });

  describe("/:id PUT", () => {
    it("should return 401 if token not provided", async () => {
      const res = await req.put("/api/movies/" + 45).send({
        title: "Gabbarsingh",
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await req
        .put("/api/movies/" + 45)
        .set("x-auth-token", "asdaj");
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();

      const res = await req.put("/api/movies/" + 45).set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if id is not a valid objectid", async () => {
      const token2 = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({
        name: "drama",
      });
      await genre.save();
      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genre: { _id: genre._id, name: genre.name },
          liked: true,
        },
      ]);

      const id = mongoose.Types.ObjectId();
      console.log(id);
      const res = await req
        .put("/api/movies/" + 12)
        .set("x-auth-token", token2);

      expect(res.status).toBe(400);
    });

    ///////////////////////////////////////////////////////////////////////////////////

    // movie.title
    it("should return 400 if title is less than 5 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "ngh",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if title is more than 50 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });
      const title = new Array(56).join("a");

      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title,
          dailyRentalRate: 23,
          numberInStocks: 34,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });
    // movie.dailyRentalRate
    it("should return 400 if dailyRentalRate is less than 10", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Golmal",
          dailyRentalRate: 9,
          numberInStocks: 34,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is more than 100 ", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 230,
          numberInStocks: 34,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });
    // movie.numberInStocks
    it("should return 400 if numberInStocks is less than 0", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });
      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 20,
          numberInStocks: -1,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStocks is more than 50", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });

      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 20,
          numberInStocks: 51,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if genreId is not a valid ObjectID", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Genre.collection.insertOne({ name: "Drama" });
      const genre = await Genre.findOne({ name: "Drama" });
      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 23,
          numberInStocks: 34,
          genre: { _id: genre._id, name: genre.name },
          liked: false,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "The Big Boss",
          dailyRentalRate: 20,
          numberInStocks: 51,
          // genreId: genre._id.toString(),
          genreId: "genre._id.toString()",
          liked: false,
        });

      expect(res.status).toBe(400);
    });

    ///////////////////////////////////////////////////////////////////////////////////

    it("should return 404 if genre with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = mongoose.Types.ObjectId();
      const genre = new Genre({
        name: "drama",
      });
      await genre.save();
      await Movie.collection.insertOne({
        title: "Inception",
        dailyRentalRate: 20,
        numberInStocks: 44,
        genre: { _id: genre._id, name: genre.name },
        liked: true,
      });
      const movie = await Movie.findOne({ title: "Inception" });
      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Inception 2",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genreId: id,
          liked: true,
        });

      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = mongoose.Types.ObjectId();
      const genre = new Genre({
        name: "drama",
      });
      await genre.save();
      await Movie.collection.insertOne({
        title: "Inception",
        dailyRentalRate: 20,
        numberInStocks: 44,
        genre: { _id: genre._id, name: genre.name },
        liked: true,
      });
      const movie = await Movie.findOne({ title: "Inception" });
      const res = await req
        .put("/api/movies/" + id)
        .set("x-auth-token", token)
        .send({
          title: "Inception 2",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genreId: genre._id,
          liked: true,
        });

      expect(res.status).toBe(404);
    });

    it("should return 200 if movie with given id is found and updated", async () => {
      const token2 = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({
        name: "drama",
      });
      await genre.save();
      await Movie.collection.insertMany([
        {
          title: "Inception",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genre: { _id: genre._id, name: genre.name },
          liked: true,
        },
      ]);

      const movie = await Movie.findOne({ title: "Inception" });

      const id = mongoose.Types.ObjectId();
      console.log(id);
      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token2)
        .send({
          title: "Inception 2",
          dailyRentalRate: 20,
          numberInStocks: 44,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(200);
    });
  });

  describe("/:id PUT", () => {
    it("should return 401 if token not provided", async () => {
      const res = await req.delete("/api/movies/" + 23);
      expect(res.status).toBe(401);
    });

    it("should return 400 if invalid token", async () => {
      const res = await req
        .delete("/api/movies/" + 23)
        .set("x-auth-token", "myinvalidtoken");
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/movies/" + 23)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if given id is not valid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .delete("/api/movies/" + 23)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId(3);

      await Movie.collection.insertOne({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 34,
        genre: { name: "Action" },
        liked: false,
      });

      const res = await req
        .delete("/api/movies/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 200 if movie with the given id deleted", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const movie = new Movie({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 34,
        genre: { name: "Action" },
        liked: false,
      });
      await movie.save();

      const res = await req
        .delete("/api/movies/" + movie._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "Gabbar Singh");
      expect(res.body).toHaveProperty("dailyRentalRate", 23);
      expect(res.body).toHaveProperty("numberInStocks", 34);
      expect(res.body).toHaveProperty("liked", false);
      expect(res.body.genre).toHaveProperty("name", "Action");
    });
  });
});
