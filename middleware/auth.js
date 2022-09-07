const jwt = require("jsonwebtoken");
const config = require("config");

const getAuthMiddleware = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access Denied");
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(400).send("Invalid Token Provided");
  }
};

module.exports = { getAuthMiddleware };
