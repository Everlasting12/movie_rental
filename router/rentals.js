const express = require("express");
const router = express.Router();
const { Movie } = require("../model/movieModel");
const { Rentals, validateRentals } = require("../model/rentalsModel");
const { Customer } = require("../model/customerModel");
const { getAuthMiddleware } = require("../middleware/auth");
const { getAdminMiddleware } = require("../middleware/admin");
const { validateObjectId } = require("../middleware/validateObjectId");

// GET all movies

router.get("/", async (req, res, next) => {
  const rentals = await Rentals.find({});
  if (rentals && rentals.length === 0)
    return res.status(404).send("Could not found any Rentals!");
  res.status(200).send(rentals);
});

// GET specific rental
router.get("/:id", validateObjectId, async (req, res, next) => {
  const rental = await Rentals.findById(req.params.id);
  if (!rental)
    return res.status(404).send("Rental with given id could not found!");
  res.status(200).send(rental);
});

// CREATE Rental

router.post("/", getAuthMiddleware, async (req, res, next) => {
  let { error } = validateRentals(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer)
    return res.status(404).send("Customer with given Id could not be found!");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie)
    return res.status(404).send("Movie with given Id could not be found!");

  if (movie.numberInStocks <= 0)
    return res.status(400).send("Movie is out of stock!");

  const rental = new Rentals({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
      numberInStocks: movie.numberInStocks - 1,
      genre: movie.genre,
      liked: movie.liked,
    },
    rentalFee: movie.dailyRentalRate * 10,
  });
  const session = await Rentals.startSession();
  session.startTransaction();
  try {
    await rental.save();
    movie.numberInStocks -= 1;
    await movie.save();
  } catch (error) {
    session.abortTransaction();
    res.status(404).send(error);
  }
  session.commitTransaction();
  session.endSession();
  res.status(200).send(rental);
});

router.delete(
  "/:id",
  validateObjectId,
  getAuthMiddleware,
  getAdminMiddleware,
  async (req, res, next) => {
    const rental = await Rentals.findById(req.params.id);
    if (!rental)
      return res.status(400).send("Rental with given id could not be found!");
    const movie = await Movie.findById(rental.movie._id);
    if (!movie)
      return res.status(400).send("Movie with given id could not be found!");
    const session = await Rentals.startSession();
    session.startTransaction();
    try {
      await Rentals.deleteOne(rental);
      movie.numberInStocks += 1;
      await movie.save();
    } catch (error) {
      session.abortTransaction();
      res.status(404).send(error);
    }
    session.commitTransaction();
    session.endSession();
    res.status(200).send("Rental with given Id is deleted!" + rental._id);
  }
);

router.patch(
  "/:id",
  validateObjectId,
  getAuthMiddleware,
  getAdminMiddleware,
  async (req, res, next) => {
    const rental = await Rentals.findById(req.params.id);
    if (!rental)
      return res.status(404).send("Rental with given id is not found!");

    const movie = await Movie.findById(rental.movie._id);
    if (!movie)
      return res.status(404).send("Movie with given id is not found!");

    const session = await Rentals.startSession();
    session.startTransaction();
    try {
      rental.dateIn = new Date(Date.now()).toLocaleString();
      rental.movie.numberInStocks += 1;
      await rental.save();
      movie.numberInStocks += 1;
      await movie.save();
    } catch (error) {
      session.abortTransaction();
      res.status(404).send(error);
    }
    session.commitTransaction();
    session.endSession();
    res.status(200).send(rental);
  }
);

module.exports = router;
