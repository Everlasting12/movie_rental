const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../../index");
const req = supertest(app);
const { User, usersSchema } = require("../../../model/usersModel");
const { Customer } = require("../../../model/customerModel");
const { Movie } = require("../../../model/movieModel");
const { Rentals } = require("../../../model/rentalsModel");
const { Genre } = require("../../../model/genresModel");

describe("/api/rentals/", () => {
  afterEach(async () => {
    await Movie.deleteMany({});
    await Genre.deleteMany({});
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

    it("should return 200 if data is valid and rental is saved", async () => {
      const genre = new Genre({ name: "Comedy" });
      await genre.save();

      const customer = new Customer({
        name: "Sidhesh",
        phone: "9594031893",
      });
      await customer.save();

      const movie = new Movie({
        title: "Hera Pheri",
        dailyRentalRate: 40,
        numberInStocks: 30,
        genre,
      });

      await movie.save();

      const token = new User().getAuthToken();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });

      expect(res.status).toBe(200);
      const rental = await Rentals.findOne({ "movie.title": "Hera Pheri" });

      expect(rental).not.toBeNull();
      expect(rental).toHaveProperty("rentalFee", 400);
    });

    it("should return 200 if rental is saved with the valid customer and movie id", async () => {
      const genre = new Genre({ name: "Slice of Life" });
      await genre.save();

      const customer = new Customer({
        name: "Akshay",
        phone: "8675897955",
      });
      await customer.save();

      const movie = new Movie({
        title: "3 Idiots",
        dailyRentalRate: 10.1,
        numberInStocks: 34,
        genre,
      });
      await movie.save();

      const token = new User().getAuthToken();
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("customer.name", "Akshay");
    });

    it("should decrement numberInStock of the movie by 1", async () => {
      const genre = new Genre({ name: "Comedy" });
      await genre.save();

      const customer = new Customer({
        name: "Shubham",
        phone: "4567876555",
      });
      await customer.save();

      let movie = new Movie({
        title: "Tere Naam",
        dailyRentalRate: 34,
        numberInStocks: 30,
        genre,
      });
      await movie.save();

      const token = new User().getAuthToken();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
        });

      movie = await Movie.findById(movie._id);
      expect(movie.numberInStocks).toBe(29);
    });
  });

  describe("/:id PATCH", () => {
    it("should return 401 if token is not provided", async () => {
      const res = await req.patch("/api/rentals/" + 23);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await req
        .patch("/api/rentals/" + 23)
        .set("x-auth-token", "asdf");

      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .patch("/api/rentals/" + 24)
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 400 if given id is invalid ObjectId", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .patch("/api/rentals/" + 234)
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = mongoose.Types.ObjectId();
      const res = await req
        .patch("/api/rentals/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const genre = new Genre({ name: "Documentary" });
      await genre.save();

      const customer = new Customer({
        name: "Akshay",
        phone: "5678900987",
      });
      await customer.save();

      const movie = new Movie({
        title: "K.G.F",
        dailyRentalRate: 70,
        numberInStocks: 40,
        genre,
      });
      await movie.save();

      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: 10 * movie.dailyRentalRate,
      });
      await rental.save();

      await Movie.deleteOne(movie);
      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 200 and update the rental if data is valid", async () => {
      const genre = new Genre({ name: "Drama" });
      await genre.save();

      const movie = new Movie({
        title: "BhootNath",
        dailyRentalRate: 30,
        numberInStocks: 23,
        genre,
      });
      await movie.save();

      const customer = new Customer({
        name: "Omkar",
        phone: "4678909876",
      });
      await customer.save();

      let rental = new Rentals({
        customer: {
          name: customer.name,
          _id: customer._id,
          phone: customer.phone,
        },
        movie,
        rentalFee: 10 * movie.dailyRentalRate,
      });

      await rental.save();

      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token);

      rental = await Rentals.findOne({ "movie.title": "BhootNath" });
      expect(res.status).toBe(200);
      expect(rental.dateIn).not.toBeNull();
    });

    it("should return 200 and update the rental if data is valid", async () => {
      const genre = new Genre({ name: "Drama" });
      await genre.save();

      const movie = new Movie({
        title: "BhootNath",
        dailyRentalRate: 30,
        numberInStocks: 23,
        genre,
      });
      await movie.save();

      const customer = new Customer({
        name: "Omkar",
        phone: "4678909876",
      });
      await customer.save();

      let rental = new Rentals({
        customer: {
          name: customer.name,
          _id: customer._id,
          phone: customer.phone,
        },
        movie,
        rentalFee: 300,
      });

      await rental.save();

      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send();
      expect(res.status).toBe(200);
      expect(res.body.dateIn).not.toBeNull();
    });

    it("should return 200 with incrementing the numberInStocks of the respective movie by 1 if data is valid", async () => {
      const genre = new Genre({ name: "Adventure" });
      await genre.save();

      const customer = new Customer({
        name: "Prajwal",
        phone: "3456798763",
      });
      await customer.save();

      let movie = new Movie({
        title: "Bang Bang",
        numberInStocks: 34,
        dailyRentalRate: 30,
        genre,
      });
      await movie.save();

      let rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.name,
        },
        movie,
        rentalFee: 10 * movie.dailyRentalRate,
      });

      await rental.save();

      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token);

      movie = await Movie.findById(movie._id);
      expect(movie.numberInStocks).toBe(35);
    });
  });

  describe("/:id DELETE", () => {
    it("should return 401 if token is not provided", async () => {
      const res = await req.delete("/api/rentals/" + 23);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await req
        .delete("/api/rentals/" + 23)
        .set("x-auth-token", "myfaketoken");
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/rentals/" + 34)
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid objectId", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .delete("/api/rentals/" + 34)
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with the given id is not found", async () => {
      const genre = new Genre({ name: "Adventure" });
      await genre.save();

      const customer = new Customer({
        name: "Prajwal",
        phone: "3456798763",
      });
      await customer.save();

      const movie = new Movie({
        title: "Bang Bang",
        numberInStocks: 34,
        dailyRentalRate: 30,
        genre,
      });
      await movie.save();

      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.name,
        },
        movie,
        rentalFee: 10 * movie.dailyRentalRate,
      });

      await rental.save();

      const token = new User({ isAdmin: true }).getAuthToken();

      const id = mongoose.Types.ObjectId();

      const res = await req
        .delete("/api/rentals/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = mongoose.Types.ObjectId();
      const genre = new Genre({ name: "Adventure" });
      await genre.save();

      const customer = new Customer({
        name: "Prajwal",
        phone: "3456798763",
      });
      await customer.save();

      let movie = new Movie({
        title: "Bang Bang",
        numberInStocks: 34,
        dailyRentalRate: 30,
        genre,
      });
      await movie.save();

      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.name,
        },
        movie,
        rentalFee: 10 * movie.dailyRentalRate,
      });

      await rental.save();

      await Movie.deleteOne(movie);

      const res = await req
        .delete("/api/rentals/" + rental._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 200 if rental is deleted with valid data", async () => {
      const genre = new Genre({ name: "Drama" });
      await genre.save();

      const customer = new Customer({ name: "Sidhesh", phone: "3456789876" });
      await customer.save();

      let movie = new Movie({
        title: "The Iron Man",
        dailyRentalRate: 40,
        numberInStocks: 20,
        genre,
      });
      await movie.save();

      const rental = new Rentals({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: 10 * movie.dailyRentalRate,
      });
      await rental.save();

      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .delete("/api/rentals/" + rental._id)
        .set("x-auth-token", token);

      movie = await Movie.findById(movie._id);
      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer.name", "Sidhesh");
      expect(res.body).toHaveProperty("movie.title", "The Iron Man");
      expect(movie.numberInStocks).toBe(21);
    });
  });
});
