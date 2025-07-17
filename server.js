require("dotenv").config(); // Should be at the top
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const menuRoutes = require("./routes/menuRoutes"); // ✅ Add menu routes

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigin = "http://localhost:5173"; // frontend URL
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/menu", menuRoutes); // ✅ API route for vendor menu

// Root test route
app.get("/", (req, res) => {
  res.send("🍽️ SmartFood API is running...");
});

// 404 route handler
app.use((req, res, next) => {
  res.status(404).json({ message: "🔍 Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
