const mongoose = require("mongoose");

const validateObjectId = (req, res, next) => {
  const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValid) return res.status(400).send("Invalid Id: " + req.params.id);
  next();
};

module.exports = { validateObjectId };


