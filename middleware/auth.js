const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access denied" });
  }
  next();
};

exports.isVendor = (req, res, next) => {
  if (req.user?.role !== "vendor") {
    return res.status(403).json({ message: "Vendor access denied" });
  }
  next();
};
