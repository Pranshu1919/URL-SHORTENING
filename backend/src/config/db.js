const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS setServers error if environment restricts it
}

const mongoose = require("mongoose");

async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl || mongoUrl.includes("<db_password>")) {
    console.warn("\n⚠️  [MongoDB Alert]: MONGO_URL contains '<db_password>'.");
    console.warn("👉 To use MongoDB Atlas, replace '<db_password>' with your real password in .env.");
    console.log("🔄 Connecting to local MongoDB at mongodb://127.0.0.1:27017/url_shortener instead...\n");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/url_shortener");
      console.log("MongoDB connected locally ✅");
      return;
    } catch (localErr) {
      console.error("Local MongoDB connection failed:", localErr.message);
    }
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB Atlas connected successfully ✅");
  } catch (error) {
    console.error("MongoDB Atlas connection failed:", error.message);
    try {
      console.log("🔄 Falling back to local MongoDB (mongodb://127.0.0.1:27017/url_shortener)...");
      await mongoose.connect("mongodb://127.0.0.1:27017/url_shortener");
      console.log("MongoDB connected locally ✅");
    } catch (fallbackErr) {
      console.error("Local MongoDB fallback also failed:", fallbackErr.message);
      process.exit(1);
    }
  }
}

module.exports = connectDB;

