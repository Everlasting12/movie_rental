const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../model/usersModel");
const lodash = require("lodash");
const bcrypt = require("bcrypt");
const mySendMail = require("../mySendMail");
const { validateObjectId } = require("../middleware/validateObjectId");
const { getAdminMiddleware } = require("../middleware/admin");
const { getAuthMiddleware } = require("../middleware/auth");

//GET all users

router.get("/", async (req, res, next) => {
  const users = await User.find();
  if (!users) return res.status(404).send("could not get the Users");
  res.status(200).send(users);
});

// GET user by id
router.get("/:id", validateObjectId, async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send("could not find the User with given id");
  res.status(200).send(lodash.pick(user, ["name", "_id", "isAdmin", "email"]));
});

router.post("/", async (req, res, next) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User is alreay registered!");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  mySendMail.main(user.email, user.name, "Register Successful!");
  await user.save();
  res.status(200).send(lodash.pick(user, ["name", "_id", "isAdmin", "email"]));
});

router.put(
  "/:id",
  validateObjectId,
  getAuthMiddleware,
  getAdminMiddleware,
  async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).send("Could not get the User with given id");

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const salt = await bcrypt.genSalt(10);

    const result = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, salt),
          isAdmin: req.body.isAdmin,
        },
      },
      { new: true, runValidators: true }
    );
    if (!result) return res.status(404).send("Could not update the user.");

    return res
      .status(200)
      .send(lodash.pick(result, ["name", "_id", "isAdmin", "email"]));
  }
);

router.delete(
  "/:id",
  validateObjectId,
  getAuthMiddleware,
  getAdminMiddleware,
  async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send("could not get the User with given id");

    const result = await User.deleteOne(user);
    if (!result) return res.status(400).send("could not delete the user");
    console.log(result);
    return res
      .status(200)
      .send(lodash.pick(user, ["name", "_id", "isAdmin", "email"]));
  }
);

module.exports = router;
