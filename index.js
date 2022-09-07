const express = require("express");
require("express-async-errors");

const {
  establishDatabaseConnection,
  closeDatabaseConnection,
} = require("./start/db");
const { getAllRoutes } = require("./start/routes");
const { getPort } = require("./start/port");
const { checkJwtPrivateKey } = require("./start/config");
const { logTheError } = require("./start/logging");

// winston and error logging
logTheError();

// chej JWT private key
checkJwtPrivateKey();

const app = express();
app.use(express.json());

//establishing the database connection.
establishDatabaseConnection();



// All Routes defined in start/routes.js
getAllRoutes(app);

// get Port number and app.listen route
if (process.env.NODE_ENV !== "test") getPort(app);

module.exports = app;
