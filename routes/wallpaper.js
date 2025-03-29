const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Wallpaper = require("../models/wallpaper");
const { isLoggedIn, isOwner, validateWallpaper } = require("../middleware");

// Index
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const wallpapers = await Wallpaper.find({}).sort({ createdAt: -1 }); // Sorts in descending order (newest first)
    res.render("wallpapers/index", { wallpapers });
  })
);

// New
router.get("/new", isLoggedIn, (req, res) => {
  res.render("wallpapers/new", { hideFooter: true });
});

// Create
router.post(
  "/",
  isLoggedIn,
  validateWallpaper,
  wrapAsync(async (req, res, next) => {
    const { wallpaper } = req.body;

    let setIsFree = wallpaper.isFree === undefined ? false : true;

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
      isFree: setIsFree,
      owner: req.user._id,
    });

    await newWallpaper.save();

    req.flash("success", "Wallpaper uploaded successfully!");
    res.redirect("/wallpapers");
  })
);

// Show
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id)
      .populate("comments")
      .populate("owner");

    if (!wallpaper) {
      req.flash("error", "The wallpaper you're looking for doesn't exist!");
      return res.redirect("/wallpapers");
    }

    res.render("wallpapers/show", { wallpaper });
  })
);

// Edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id);

    if (!wallpaper) {
      req.flash("error", "The wallpaper you're looking for doesn't exist!");
      return res.redirect("/wallpapers");
    }

    res.render("wallpapers/edit", { wallpaper, hideFooter: true });
  })
);

// Update
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateWallpaper,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { wallpaper } = req.body;

    let setIsFree = wallpaper.isFree === undefined ? false : true;

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
        isFree: setIsFree,
      },
      { new: true } // Return the updated document
    );

    console.log(updatedWallpaper);
    req.flash("success", "Wallpaper updated successfully!");
    res.redirect(`/wallpapers/${id}`);
  })
);

// Destroy
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let deletingWall = await Wallpaper.findByIdAndDelete(id);

    if (!deletingWall) {
      req.flash("error", "The wallpaper you're looking for doesn't exist!");
      return res.redirect("/wallpapers");
    }

    console.log(deletingWall);
    req.flash("deleted", "Wallpaper deleted successfully!");
    res.redirect("/wallpapers");
  })
);

module.exports = router;
