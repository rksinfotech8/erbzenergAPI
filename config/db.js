require("dotenv").config({ path: "./config/.env" });

const sql = require("mssql");

const config = {
  user: process.env.DB_USER?.trim(), // Remove accidental spaces
  password: process.env.DB_PASSWORD?.trim(),
  server: process.env.DB_SERVER?.trim(),
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME?.trim(),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const connectDB = async () => {
  try {
    console.log("Attempting to connect with config:", config);
    await sql.connect(config);
    console.log("✅ Database Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection Failed:", err.message);
  }
};

module.exports = { connectDB, sql };
