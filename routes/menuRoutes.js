const express = require("express");
const router = express.Router();
const multer = require("multer");
const MenuItem = require("../models/MenuItem");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

// Cloudinary config (ensure these are in your .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage to get file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload to Cloudinary from buffer
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "menu_items" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// GET all menu items
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

// POST new item with image upload to Cloudinary
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, available } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required." });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const newItem = new MenuItem({
      name,
      price,
      category,
      available: available === "true",
      imageUrl,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).json({ message: "Server error while creating menu item" });
  }
});

// PUT update item with optional image upload
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, available } = req.body;
    const updatedData = {
      name,
      price,
      category,
      available: available === "true",
    };

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      updatedData.imageUrl = imageUrl;
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// DELETE item
router.delete("/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
