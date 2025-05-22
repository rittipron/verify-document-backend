const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_jwt_secret';  // คีย์สำหรับ JWT

// Middleware เพื่อตรวจสอบ JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // รับ token จาก Header
  
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      // ตรวจสอบ token และ decode ข้อมูล
      const decoded = jwt.verify(token, SECRET_KEY);  // ตรวจสอบและ decode token
      
      req.user = decoded;  // เก็บข้อมูลผู้ใช้ไว้ใน request

      // หาก token หมดอายุ (jwt.verify จะโยน error เมื่อหมดอายุ)
      if (decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({ message: 'Token has expired.' });
      }

      next();  // ให้ไปยังเส้นทางถัดไป
    } catch (error) {
      return res.status(400).json({ message: 'Invalid token.', error: error.message });
    }
};

module.exports = { verifyToken };
