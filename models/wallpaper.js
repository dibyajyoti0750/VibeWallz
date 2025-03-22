const mongoose = require("mongoose");
const { Schema } = mongoose;

const wallpaperSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/dqw6dicdi/image/upload/v1742616594/32747-2560x2048-desktop-hd-your-name-background-photo_msjet9.jpg",
    set: (v) =>
      v === ""
        ? "https://res.cloudinary.com/dqw6dicdi/image/upload/v1742616594/32747-2560x2048-desktop-hd-your-name-background-photo_msjet9.jpg"
        : v,
  },
  category: { type: String },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wallpaper", wallpaperSchema);
