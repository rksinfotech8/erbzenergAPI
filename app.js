const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {connectDB} = require("./config/db");
const cors = require("cors");
require("dotenv").config();
const path = require("path");



const productRoutes = require("./routes/productRoutes");

connectDB();
app.use(cors());
app.use(bodyParser.json());

app.use("/api",productRoutes);
// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;