const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/responses");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

exports.register = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
    });

    const token = signToken(newUser._id);

    res.status(201).json(
      ApiResponse.success("User registered successfully", {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        },
        token,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(ApiResponse.error("Please provide email and password"));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json(ApiResponse.error("Invalid credentials"));
    }

    const token = signToken(user._id);

    res.status(200).json(
      ApiResponse.success("Login successful", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      })
    );
  } catch (err) {
    next(err);
  }
};
