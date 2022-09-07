const express = require("express");
const router = express.Router();
const { Genre } = require("../model/genresModel");
const { Movie, validateMovies } = require("../model/movieModel");
const { getAuthMiddleware } = require("../middleware/auth");
const { getAdminMiddleware } = require("../middleware/admin");
const { validateObjectId } = require("../middleware/validateObjectId");

//CRUD operations

// 1. GET all movies

router.get("/", async (req, res, next) => {
  const movies = await Movie.find({});
  if (movies && movies.length === 0)
    return res.status(404).send("Movies not found..");
  res.status(200).send(movies);
});

// GET by ID:

router.get("/:id", validateObjectId, async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send("Movie with the given ID not found!");
  res.status(200).send(movie);
});

// POST movies || Create movies

router.post("/", getAuthMiddleware, async (req, res, next) => {
  const { error } = validateMovies(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send("Genre with given ID not found..");

  const movie = new Movie({
    title: req.body.title,
    dailyRentalRate: req.body.dailyRentalRate,
    numberInStocks: req.body.numberInStocks,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    liked: req.body.liked,
  });
  await movie.save();
  res.status(200).send(movie);
});

// UPDATE record:

router.put(
  "/:id",
  getAuthMiddleware,
  getAdminMiddleware,
  validateObjectId,
  async (req, res, next) => {
    console.log("I AM SID");
    console.log(req.body);
    const { error } = validateMovies(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre)
      return res.status(404).send("genre with the given id is not found");

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          dailyRentalRate: req.body.dailyRentalRate,
          numberInStocks: req.body.numberInStocks,
          liked: req.body.liked,
          genre: { _id: genre._id, name: genre.name },
        },
      },
      { new: true, runValidators: true }
    );
    if (!movie)
      return res.status(404).send("movie with the given id is not found");
    res.status(200).send(movie);
  }
);

// DELETE record/movie;

router.delete(
  "/:id",
  getAuthMiddleware,
  getAdminMiddleware,
  validateObjectId,
  async (req, res, next) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).send("Movie could not be found.!");
    return res.status(200).send(movie);
  }
);


module.exports = router;
