const mongoose = require("mongoose");
const { Schema } = mongoose;
const Comment = require("./comment");

const wallpaperSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: {
      type: String,
      default: "https://placehold.co/600x800/000000/FFF",
      set: (v) => (v === "" ? "https://placehold.co/600x800/000000/FFF" : v),
    },
    category: { type: String },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
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
      required: true,
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
