const express = require('express');
const router = express.Router();
const { verifyToken } = require("../../middleware/verifyToken");
const { verifyDocument, verifyData } = require('../../controllers/verifyDocControllers');
const { getAllUsers, getUserById } = require('../../controllers/userControllers');

router.post("/verifyData", verifyToken, verifyData);
router.post("/verifyDocument", verifyToken, verifyDocument);
router.post("/getAllUsers", verifyToken, getAllUsers);
router.post("/getUserById", verifyToken, getUserById);

module.exports = router;
