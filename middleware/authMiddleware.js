const { verifyToken } = require("../utils/jwtHelper");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access Denied! No Token Provided." });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(400).json({ message: "Invalid Token" });
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;
