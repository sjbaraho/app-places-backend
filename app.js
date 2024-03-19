const express = require("express");
const app = express();

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");

app.use(express.json());

app.use("/api/places", placesRoutes);

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

app.listen(5000);
