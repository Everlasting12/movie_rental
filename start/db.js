const mongoose = require("mongoose");
require("dotenv").config();
const config = require("config");
async function establishDatabaseConnection() {
  // await mongoose.connect(process.env.MONGO_URI);

  await mongoose.connect(config.get("MONGO_URI"));
  console.log(
    `Database connected in ${process.env.NODE_ENV} \n${config.get(
      "MONGO_URI"
    )}`
  );
}

async function closeDatabaseConnection() {
  await mongoose.connection.close();
  console.log("database connection stopped!");
}

module.exports = { establishDatabaseConnection, closeDatabaseConnection };
