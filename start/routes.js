const genreRouter = require("../router/genre");
const customerRouter = require("../router/customer");
const movieRouter = require("../router/movies");
const rentalsRouter = require("../router/rentals");
const usersRouter = require("../router/users");
const loginRouter = require("../router/logins");
const { errorMiddleware } = require("../middleware/error");

function getAllRoutes(app) {
  app.use("/api/genres", genreRouter);

  // routes for Customers.
  app.use("/api/customers", customerRouter);

  // routes for Movies.
  app.use("/api/movies", movieRouter);

  //routes for Rentals
  app.use("/api/rentals", rentalsRouter);

  //routes for Users
  app.use("/api/users", usersRouter);

  //routes for Logins
  app.use("/api/login", loginRouter);

  // error middlewere
  app.use(errorMiddleware);
}

module.exports = { getAllRoutes };
