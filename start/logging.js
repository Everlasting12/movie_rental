const winston = require("winston");
require("winston-mongodb");

const dotenv = require("dotenv");
dotenv.config();

function logTheError() {
  winston.configure({
    transports: [
      new winston.transports.File({ filename: "logfile.log" }),
      new winston.transports.Console(),
      new winston.transports.MongoDB({
        db: process.env.MONGO_URI,
        options: { useUnifiedTopology: true },
      }),
    ],
  });

  process.on("uncaughtException", (err) => {
    winston.error("We got an uncaught exception" + err);
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  process.on("unhandledRejection", (err) => {
    winston.error("We got unhandled rejection" + err);
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });
}

module.exports = { logTheError };
