const mongoose = require("mongoose");
const { Schema } = mongoose;
const Comment = require("./comment");

const wallpaperSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: {
      url: String,
      filename: String,
    },
    category: { type: String },
    tags: [{ type: String }],
    downloads: { type: Number, default: 0 },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: String,
      required: false,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    isFree: { type: Boolean },
  },
  { timestamps: true } // Enables createdAt and updatedAt automatically
);

wallpaperSchema.post("findOneAndDelete", async (wallpaper) => {
  if (wallpaper) {
    await Comment.deleteMany({ _id: { $in: wallpaper.comments } });
  }
});

module.exports = mongoose.model("Wallpaper", wallpaperSchema);
