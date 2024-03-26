const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeID = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeID);
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(err);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided ID",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userID = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userID });
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not find places",
      500
    );
    return next(err);
  }

  if (places.length === 0) {
    const err = new HttpError(
      "Could not find places for the provided user ID",
      404
    );
    return next(err);
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description, address, creator } = req.body;
  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator,
    image: "https://picsum.photos",
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError("Creating place failed, please try again.", 500);
    return next(err);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError("Creating place failed, please try again.", 500);
    return next(err);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const placeID = req.params.pid;
  const { title, description } = req.body;
  let place;

  try {
    place = await Place.findById(placeID);
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(err);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new HttpError(
      "Something went wronf, could not update place.",
      500
    );
    return next(err);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeID = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeID).populate("creator");

    if (!place) {
      const error = new HttpError("Could not find a place for this id.", 404);
      return next(error);
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Place.deleteOne(place).session(sess);
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
