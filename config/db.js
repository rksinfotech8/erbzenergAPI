require("dotenv").config();
const sql = require("mssql");

const config = {
  user: "apsar11_",
  password:  "admin@123",
  server:  "sql.bsite.net\\MSSQL2016", 
  database: "apsar11_",
  options: {
    encrypt: false, 
    trustServerCertificate: true,
  },
};

const connectDB = async () => {
  try {
    if (!sql.connected) {
      await sql.connect(config);
      console.log("✅ Database Connected");
    }
  } catch (err) {
    console.error("❌ Database Connection Failed:", err.message);
  }
};

module.exports = { connectDB, sql };