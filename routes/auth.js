const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { validateMulti } = require("../utils/formatValidate");
const { v4: uuidv4 } = require('uuid'); // import UUID
require("dotenv").config();

const router = express.Router();

// REGISTER (ลงทะเบียน)
router.post("/register", async (req, res) => {
  const { username, email, password, address, phone, passport, account, first_name, last_name } = req.body;
  const keyValidate = ["username", "email", "password", "address", "phone", "passport", "first_name", "last_name"];

  // ตรวจสอบค่าที่จำเป็น
  const validate = validateMulti(req.body, keyValidate);
  if (!validate.isValid) {
    return res.status(400).json({ message: `Missing fields: ${validate.missingKeys.join(", ")}` });
  }

  try {
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (id, password, username, email, address, phone, passport, account, active, create_date, update_date, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)
    `;

    // สร้าง UUID สำหรับ id
    const id = uuidv4();  // สร้าง UUID สำหรับ id

    // สร้างเวลา create_date และ update_date
    const currentTimestamp = new Date();
    const create_date = currentTimestamp.toISOString().slice(0, 19).replace("T", " "); // รูปแบบ: YYYY-MM-DD HH:MM:SS
    const update_date = create_date; // สามารถใช้ค่าเดียวกับ create_date
    const active = false;

    // กำหนดค่า default ของ account ถ้าไม่มี
    const userAccount = account || '';

    // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
    db.query(
      sql,
      [id, hashedPassword, username, email, address, phone, passport, userAccount, active, create_date, update_date, first_name, last_name, "user"],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "User registered successfully" });
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// REGISTER (ลงทะเบียนสำหรับ ADMIN เท่านั้น)
router.post("/registerAdmin", async (req, res) => {
  const { username, email, password, address, phone, passport, account, first_name, last_name } = req.body;
  
  // ตรวจสอบการส่งข้อมูลที่จำเป็น
  const keyValidate = ["username", "email", "password", "address", "phone", "passport", "first_name", "last_name"];
  const validate = validateMulti(req.body, keyValidate);

  if (!validate.isValid) {
    return res.status(400).json({ message: `Missing fields: ${validate.missingKeys.join(", ")}` });
  }

  try {
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง UUID สำหรับ id
    const id = uuidv4();  // สร้าง UUID สำหรับ id

    // สร้างเวลา create_date และ update_date
    const currentTimestamp = new Date();
    const create_date = currentTimestamp.toISOString().slice(0, 19).replace("T", " "); // รูปแบบ: YYYY-MM-DD HH:MM:SS
    const update_date = create_date; // สามารถใช้ค่าเดียวกับ create_date
    const active = true; // กำหนดให้ account เป็น active ทันที

    // SQL สำหรับการบันทึกข้อมูลผู้ใช้
    const sql = `
      INSERT INTO users (id, password, username, email, address, phone, passport, account, active, create_date, update_date, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // กำหนดค่า default ของ account ให้เป็น admin
    const role = 'admin';  // ระบุ role ว่าเป็น admin

    // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
    db.query(
      sql,
      [id, hashedPassword, username, email, address, phone, passport, account, active, create_date, update_date, first_name, last_name, role],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Admin registered successfully" });
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});


// LOGIN (เข้าสู่ระบบ)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Email is required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];

    // ถ้าเป็น Admin ให้เข้าสู่ระบบโดยไม่ต้องเช็ครหัสผ่าน
    if (user.role === "admin") {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, active: user.active },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.json({ message: "Admin login successful", token });
    }

    // ตรวจสอบรหัสผ่านสำหรับ user ทั่วไป
    if (!password) {
      return res.status(400).json({ message: "Password is required for normal users" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, active: user.active },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
});


module.exports = router;
