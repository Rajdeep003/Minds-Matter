const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.blocked) {
      return res.status(401).json({ message: "User is unavailable or blocked." });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have access to this action." });
  }

  next();
};

module.exports = { protect, authorize };
