const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiResponse = require("../utils/responses");

exports.protect = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json(
          ApiResponse.error(
            "You are not logged in. Please log in to get access"
          )
        );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json(
          ApiResponse.error("The user belonging to this token no longer exists")
        );
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json(ApiResponse.error("Invalid token"));
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          ApiResponse.error("You do not have permission to perform this action")
        );
    }
    next();
  };
};
