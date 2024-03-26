const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError(
      "Finding users failed, please try again later.",
      500
    );
    return next(err);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signing up failed. Please try again later", 500);
    return next(err);
  }

  if (existingUser) {
    const err = new HttpError("User already exists, please login instead", 422);
    return next(err);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image: "https://picsum.photos",
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again");
    return next(err);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signing up failed. Please try again later", 500);
    return next(err);
  }

  if (!existingUser || existingUser.password !== password) {
    const err = new HttpError("Invalid credentials, could not log you in", 401);
    return next(err);
  }

  res.json({ message: "Logged In!" });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;
