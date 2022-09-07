const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const { genreSchema } = require("../model/genresModel");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    minLength: [5, "Movie name should be greater than 5 characters"],
    maxLength: [50, "Movie name should be greater than 50 characters"],
    required: true,
  },
  genre: { type: genreSchema, required: true },
  dailyRentalRate: {
    type: Number,
    min: 10,
    max: 100,
    required: true,
  },
  numberInStocks: {
    type: Number,
    min: 0,
    max: 50,
    required: true,
  },
  liked: {
    type: Boolean,
    default: false,
  },
});

const Movie = mongoose.model("movie", movieSchema);

function validateMovies(customer) {
  let schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    dailyRentalRate: Joi.number().min(10).max(100).required(),
    numberInStocks: Joi.number().min(0).max(50).required(),
    genreId: Joi.objectId(),
    liked: Joi.boolean(),
  });

  return schema.validate(customer);
}

module.exports = { Movie, validateMovies, movieSchema };
