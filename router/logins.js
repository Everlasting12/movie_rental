const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User } = require("../model/usersModel");
const mySendMail = require("../mySendMail");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].messsage);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid User or Password!");

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send("Invalid Email or Password!");
  // mySendMail.main(user.email, user.name, "Login Successful!");
  const token = user.getAuthToken();
  res.status(200).send(token);
});

function validate(data) {
  const schema = Joi.object({
    email: Joi.string().min(8).max(255).required().email(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return schema.validate(data);
}
module.exports = router;
