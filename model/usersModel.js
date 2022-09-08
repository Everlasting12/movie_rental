const Joi = require("joi");
const { default: mongoose, Schema } = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const usersSchema = new Schema({
  name: {
    type: String,
    minLength: [5, "Username should be atleast 5 characters long"],
    maxLength: [50, "Username should be atmost 50 characters long"],
    required: true,
  },
  email: {
    type: String,
    minLength: [5, "Username should be atleast 5 characters long"],
    maxLength: [255, "Username should be atmost 255 characters long"],
    required: true,
  },
  password: {
    type: String,
    minLength: [8, "Username should be atleast 8 characters long"],
    maxLength: [1024, "Username should be atmost 1024 characters long"],
    required: true,
  },
  isAdmin: { type: Boolean, default: false },
});

usersSchema.methods.getAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("user", usersSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(1024).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

module.exports = { User, usersSchema, validateUser };
