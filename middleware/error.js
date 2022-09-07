const winston = require("winston");
const errorMiddleware = (error, req, res, next) => {
 
  winston.log("error", error.message);
  return res.status(500).send("Something Failed! : " + error.message);
};

module.exports = { errorMiddleware };
