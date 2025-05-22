const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const apiBase = require("./routes/api");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const path = require("path");
const app = express();
const uploadsDir = path.join(__dirname, "uploads");

app.use(express.json({ limit: '50mb' })); // ปรับเป็นขนาดที่ต้องการ เช่น 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(bodyParser.json());

app.use("/uploads", express.static(uploadsDir));
app.use("/auth", authRoutes);
app.use("/api", apiBase);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
