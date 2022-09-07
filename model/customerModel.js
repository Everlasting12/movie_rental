const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [5, "Name should be atleast 5 characters longs"],
    maxLength: [50, "Name should be atmost 50 characters long"],
    required: true,
  },
  phone: {
    type: String,
    minLength: [7, "Phone should be atleast 7 digits long"],
    maxLength: [10, "Name should be atmost 10 digits long"],
    required: true,
  },
  isGold: { type: Boolean, default: false },
});

const Customer = mongoose.model("customer", customerSchema);

function validateCustomer(customer) {
  let schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(7).max(10).required(),
    isGold: Joi.boolean(),
  });

  return schema.validate(customer);
}

module.exports = { Customer, customerSchema, validateCustomer };
