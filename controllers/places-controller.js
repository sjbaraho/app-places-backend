const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "Famous SkyScraper",
    location: { lat: 40.7484445, lng: -73.9882393 },
    address: "20 W 34th St., New York, NY 10001",
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire State Building",
    description: "Famous SkyScraper",
    location: { lat: 40.7484445, lng: -73.9882393 },
    address: "20 W 34th St., New York, NY 10001",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeID = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeID);

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided ID", 404)
    );
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userID = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userID);

  if (places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user ID", 404)
    );
  }
  res.json({ places });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const placeID = req.params.pid;
  const { title, description } = req.body;
  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeID) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeID);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeID = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id != placeID);
  res.status(200).json({ message: "Place deleted." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
