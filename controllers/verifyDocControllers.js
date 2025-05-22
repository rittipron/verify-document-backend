const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const db = require("../db");
const mime = require("mime-types");

// ตรวจสอบว่าเป็น Base64 หรือไม่
const isBase64 = (str) => {
  try {
    return (
      Buffer.from(str, "base64").toString("base64") === str.replace(/\s/g, "")
    );
  } catch (err) {
    return false;
  }
};

// ตรวจสอบว่าเป็น UUID หรือไม่
const isValidUUID = (uuid) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

const verifyDocument = (req, res) => {
  const { document_name, document_base64, document_type } = req.body;
  const user_id = req.user.id;

  // ตรวจสอบค่าที่จำเป็น
  if (!document_name || !document_base64 || !document_type) {
    return res
      .status(400)
      .json({ message: "Document name, file, and file type are required." });
  }

  if (!isBase64(document_base64)) {
    return res.status(400).json({ message: "Invalid Base64 format." });
  }

  if (!isValidUUID(user_id)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  const allowedFileTypes = ["jpg", "jpeg", "png", "pdf"];
  const fileExtension = mime.extension(document_type);

  if (!allowedFileTypes.includes(fileExtension)) {
    return res.status(400).json({ message: "Invalid file type." });
  }

  const document_id = uuidv4();
  const fileName = `${document_id}.${fileExtension}`;
  const uploadsDir = path.join(__dirname, "..", "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const documentPath = path.join(uploadsDir, fileName);

  fs.writeFile(documentPath, Buffer.from(document_base64, "base64"), (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error saving the file.", error: err });
    }

    if (!fs.existsSync(documentPath)) {
      return res.status(500).json({ message: "File was not saved correctly." });
    }

    const document_url = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${fileName}`;

    const sql = `
      INSERT INTO verification_documents (id, user_id, document_name, document_url, verified)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [document_id, user_id, document_name, document_url, false],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }

        const updateSql = "UPDATE users SET active = ? WHERE id = ?";

        db.query(updateSql, [true, user_id], (err, updateResult) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error updating user status", error: err });
          }

          res
            .status(201)
            .json({
              message: "Document submitted successfully.",
              document_url,
            });
        });
      }
    );
  });
};

const verifyData = (req, res) => {
  try {
    const updateSql =
      "UPDATE verification_documents SET verified = ? WHERE id = ?";
    const { userId, document_id } = req.body;

    db.query(updateSql, [true, document_id], (err, updateResult) => {
      if (err) {
        return res
          .status(500)
          .json({
            message: "Error updating verification documents verified",
            error: err,
          });
      }

      res
        .status(201)
        .json({ message: "Document submitted successfully.", userId });
    });
  } catch (err) {
    return false;
  }
};

module.exports = { verifyDocument, verifyData };
