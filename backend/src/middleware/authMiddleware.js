const jwt = require('jsonwebtoken');
const User = require('../models/User');


// PROTECT — checks if user is logged in

const protect = async (req, res, next) => {
  try {
    let token;

    // JWT is sent in the Authorization header like:
    // "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]; // get part after "Bearer "
    }

    // No token found
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token — throws error if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "64f3...", role: "user", iat: ..., exp: ... }

    // Attach user to request object so controllers can use it
    req.user = decoded;

    next(); // move to the next function (the controller)
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};


// AUTHORIZE — checks if user has required role

const authorize = (...roles) => {
  // This returns a middleware function
  // "...roles" means you can pass multiple roles like authorize('admin', 'organizer')
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };