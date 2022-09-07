const mongoose = require("mongoose");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const { Movie, movieSchema } = require("./movieModel");
// const { Customer, customerSchema } = require("./customerModel");

const rentalsSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        minLength: [5, "Name should be atleast 3 characters longs"],
        maxLength: [50, "Name should be atmost 50 characters long"],
        required: true,
      },
      phone: {
        type: String,
        minLength: [7, "Phone should be atleast 7 digits long"],
        maxLength: [10, "Name should be atmost 10 digits long"],
        required: true,
      },
    }),
    required: true,
  },
  movie: {
    type: movieSchema,
    required: true,
  },
  rentalFee: {
    type: Number,
    min: 0,
    required: true,
  },
  dateOut: {
    type: Date,
    default: new Date(Date.now()),
  },
  dateIn: { type: String, default: null },
});

const Rentals = mongoose.model("rental", rentalsSchema);

function validateRentals(rentals) {
  const schema = Joi.object({
    customerId: Joi.objectId(),
    movieId: Joi.objectId(),
  });

  return schema.validate(rentals);
}

module.exports = { validateRentals, rentalsSchema, Rentals };
