// require("dotenv").config();
// const winston = require("winston");

function checkJwtPrivateKey() {
  if (!process.env.jwtPrivateKey) {
    winston.log("error", "We got an undefined jwtPrivateKey");
    process.exit(1);
  }
}

module.exports = { checkJwtPrivateKey };
