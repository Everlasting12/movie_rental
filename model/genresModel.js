// const express = require("express");
// const router = express.Router();

// router.use(express.json());
const Joi = require("joi");

const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Genre name should be greater than 5 characters"],
    maxLength: [50, "Genre name should be greater than 50 characters"],
  },
});
const Genre = mongoose.model("genre", genreSchema);

function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(genre);
}

module.exports = { Genre, genreSchema, validateGenre };
