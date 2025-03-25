const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { wallpaperSchema } = require("../schema");
const Wallpaper = require("../models/wallpaper");

const validateWallpaper = (req, res, next) => {
  let { error } = wallpaperSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const wallpapers = await Wallpaper.find({});
    res.render("wallpapers/index", { wallpapers });
  })
);

// New
router.get("/new", (req, res) => {
  res.render("wallpapers/new", { hideFooter: true });
});

// Create
router.post(
  "/",
  validateWallpaper,
  wrapAsync(async (req, res, next) => {
    const { wallpaper } = req.body;

    let formattedTags = [];
    if (typeof wallpaper.tags === "string") {
      formattedTags = wallpaper.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag, index, self) => tag && self.indexOf(tag) === index); // Remove empty & duplicate tags
    }

    const newWallpaper = new Wallpaper({
      ...wallpaper, // Spread all properties
      tags: formattedTags, // Overwrite tags with formatted ones
    });

    await newWallpaper.save();
    res.redirect("/wallpapers");
  })
);

// Show
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id).populate("comments");

    if (!wallpaper) {
      throw new ExpressError(404, "Wallpaper not found!");
    }

    res.render("wallpapers/show", { wallpaper });
  })
);

// Edit
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id);

    if (!wallpaper) {
      throw new ExpressError(404, "Wallpaper not found!");
    }

    res.render("wallpapers/edit", { wallpaper, hideFooter: true });
  })
);

// Update
router.put(
  "/:id",
  validateWallpaper,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { wallpaper } = req.body;

    let formattedTags = [];
    if (typeof wallpaper.tags === "string") {
      formattedTags = wallpaper.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(
          (tag, index, self) => tag !== "" && self.indexOf(tag) === index
        );
    }

    const updatedWallpaper = await Wallpaper.findByIdAndUpdate(
      id,
      {
        ...wallpaper,
        tags: formattedTags,
      },
      { new: true } // Return the updated document
    );

    console.log(updatedWallpaper);
    res.redirect(`/wallpapers/${id}`);
  })
);

// Destroy
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let deletedWall = await Wallpaper.findByIdAndDelete(id);

    if (!deletedWall) {
      throw new ExpressError(404, "Wallpaper not found!");
    }

    console.log(deletedWall);
    res.redirect("/wallpapers");
  })
);

module.exports = router;
