const db = require("../db"); // นำเข้าเชื่อมต่อกับฐานข้อมูล

// ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด
const getAllUsers = (req, res) => {
  const sql = "SELECT * FROM users WHERE NOT roles == admin";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json(results); // ส่งข้อมูลผู้ใช้ทั้งหมด
  });
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม user_id
const getUserById = (req, res) => {
  const { userId } = req.body; // ดึง user_id จาก URL params

  const sql = `
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.address, 
            u.passport, 
            u.active,
            v.id AS document_id,
            v.document_name,
            v.document_url,
            v.verified,
            v.created_at AS document_created_at,
            v.updated_at AS document_updated_at
        FROM users u
        LEFT JOIN verification_documents v ON u.id = v.user_id
        WHERE u.id = ?;
    `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(results[0]); // ส่งข้อมูลผู้ใช้
  });
};

module.exports = { getAllUsers, getUserById };
