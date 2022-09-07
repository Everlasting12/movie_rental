const jwt = require("jsonwebtoken");
const config = require("config");

const getAdminMiddleware = (req, res, next) => {
  const isAdmin = req.user.isAdmin;
  if (!isAdmin) return res.status(403).send("Access Forbidden!");
  next();
};

module.exports = { getAdminMiddleware };
