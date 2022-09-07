const express = require("express");
const router = express.Router();
const { Genre, validateGenre } = require("../model/genresModel");
const { getAuthMiddleware } = require("../middleware/auth");
const { getAdminMiddleware } = require("../middleware/admin");
const { validateObjectId } = require("../middleware/validateObjectId");
const winston = require("winston/lib/winston/config");

//CRUD operation:
// read whole collection:

router.get("/", async (req, res) => {
  const genres = await Genre.find({});
  if (genres && genres.length === 0)
    return res.status(404).send("Genres not found");
  res.status(200).send(genres);
});

// READ specific item;

router.get("/:id", validateObjectId, async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre)
    return res.status(404).send("Genre with given Id could not be found");

  res.status(200).send(genre);
});

// create genre
router.post("/", getAuthMiddleware, async (req, res, next) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genreQuery = new RegExp("^" + req.body.name.toLowerCase().trim(), "i");

  let genre = await Genre.findOne({
    name: genreQuery,
  });
  if (genre) return res.status(404).send("Genre name is already exists!");

  genre = new Genre({
    name: req.body.name,
  });

  await genre.save();
  res.status(200).send(genre);
});

//update genre

router.put(
  "/:id",
  getAuthMiddleware,
  validateObjectId,
  // getAdminMiddleware,
  async (req, res, next) => {
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: req.body.name },
      },
      { new: true, runValidators: true }
    );
    if (!genre)
      return res.status(404).send("Genre with given ID could not be found");
    res.status(200).send(genre);
  }
);

// DELETE specific item;

router.delete(
  "/:id",
  getAuthMiddleware,
  getAdminMiddleware,
  validateObjectId,
  async (req, res, next) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("genre with given id is not found");

    // setTimeout(async (error) => {
    //   console.log("I am in brefore");
    await Genre.deleteOne({ _id: req.params.id });
    res.status(200).send(genre);
    //   console.log("I am done after");
    // }, 5000);
    // await Genre.deleteOne({ _id: req.params.id });
  }
);

module.exports = router;
