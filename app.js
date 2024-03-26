const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(express.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  //check if the response has already been sent
  if (res.headerSent) {
    return next(error);
  }
  //otherwise send error response
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured." });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@app-places.v9xwgd1.mongodb.net/places`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
