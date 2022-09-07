const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../model/usersModel");
const { Customer } = require("../../../model/customerModel");
const { Movie } = require("../../../model/movieModel");
const { Rentals } = require("../../../model/rentalsModel");

describe("/api/rentals/", () => {
  afterEach(async () => {
    await Movie.deleteMany({});
    await Customer.deleteMany({});
    await Rentals.deleteMany({});
  });
  describe("/ GET", () => {
    it("should return 200 with all the rentals if any", async () => {
      const movie = new Movie({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 34,
        genre: { name: "Action" },
        liked: false,
      });
      await movie.save();

      const customer = new Customer({
        name: "Sidhesh",
        phone: "9594031927",
        isGold: "true",
      });
      await customer.save();
      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const res = await req.get("/api/rentals/");
      expect(res.status).toBe(200);

      expect(res.body.some((r) => r.customer.name === "Sidhesh")).toBeTruthy();
      expect(
        res.body.some((r) => r.customer.phone === "9594031927")
      ).toBeTruthy();
      expect(
        res.body.some((r) => r.movie.title === "Gabbar Singh")
      ).toBeTruthy();
      expect(res.body.some((r) => r.movie.dailyRentalRate === 23)).toBeTruthy();
      expect(res.body.some((r) => r.movie.numberInStocks === 34)).toBeTruthy();
    });

    it("should return 404 if rentals not found", async () => {
      const res = await req.get("/api/rentals/");
      expect(res.status).toBe(404);
    });
  });

  describe("/:id GET", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await req.get("/api/rentals/" + 23);
      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with the given id not found", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await req.get("/api/rentals/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 200 if rental with the given id is found", async () => {
      const movie = new Movie({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 34,
        genre: { name: "Action" },
        liked: false,
      });
      await movie.save();

      const customer = new Customer({
        name: "Sidhesh",
        phone: "9594031927",
        isGold: "true",
      });
      await customer.save();
      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const res = await req.get("/api/rentals/" + rental._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.customer).toHaveProperty("_id");
      expect(res.body.movie).toHaveProperty("_id");
      expect(res.body).toHaveProperty("rentalFee", 230);
      expect(res.body.customer).toHaveProperty("name", "Sidhesh");
      expect(res.body.customer).toHaveProperty("phone", "9594031927");
      expect(res.body.movie).toHaveProperty("title", "Gabbar Singh");
      expect(res.body.movie).toHaveProperty("dailyRentalRate", 23);
      expect(res.body.movie).toHaveProperty("numberInStocks", 34);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if token not provided", async () => {
      const res = await req.post("/api/rentals/");
      expect(res.status).toBe(401);
    });
    it("should return 400 if token is invalid", async () => {
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", "myfaketoken");

      expect(res.status).toBe(400);
    });

    it("should return 400 if customerId is not a valid Object ID", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: "234" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not a valid Object ID", async () => {
      const token = new User().getAuthToken();
      const customerId = mongoose.Types.ObjectId();
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId, movieId: "a234" });

      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with the given customerId is not found", async () => {
      const token = new User().getAuthToken();
      const customerId = mongoose.Types.ObjectId();
      const movieId = mongoose.Types.ObjectId();
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId, movieId });

      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with the given movieId is not found", async () => {
      const token = new User().getAuthToken();

      const movie = new Movie({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 34,
        genre: { name: "Action" },
        liked: false,
      });
      await movie.save();

      const customer = new Customer({
        name: "Sidhesh",
        phone: "9594031927",
        isGold: "true",
      });
      await customer.save();
      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();

      const customerId = customer._id;
      const movieId = mongoose.Types.ObjectId();
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId, movieId });

      expect(res.status).toBe(404);
    });

    it("should return 400 if movie's number of stocks <= 0", async () => {
      const token = new User().getAuthToken();

      const movie = new Movie({
        title: "Gabbar Singh",
        dailyRentalRate: 23,
        numberInStocks: 0,
        genre: { name: "Action" },
        liked: false,
      });
      await movie.save();

      const customer = new Customer({
        name: "Sidhesh",
        phone: "9594031927",
        isGold: "true",
      });
      await customer.save();

      const customerId = customer._id;
      const movieId = movie._id;
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId, movieId });

      expect(res.status).toBe(400);
    });
  });
});
