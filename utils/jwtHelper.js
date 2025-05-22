const jwt = require("jsonwebtoken");
require("dotenv").config();

// สร้าง Token (ใช้ใน Login)
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// ตรวจสอบ Token ว่าถูกต้องไหม
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
