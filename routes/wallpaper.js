const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateWallpaper } = require("../middleware");
const wallpaperController = require("../controllers/wallpapers");

router.get("/", wrapAsync(wallpaperController.index));

router.get("/new", isLoggedIn, wallpaperController.renderNewForm);

router.post(
  "/",
  isLoggedIn,
  validateWallpaper,
  wrapAsync(wallpaperController.uploadWallpaper)
);

router.get("/:id", wrapAsync(wallpaperController.showWallpaper));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(wallpaperController.renderEditForm)
);

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateWallpaper,
  wrapAsync(wallpaperController.updateWallpaper)
);

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(wallpaperController.deleteWallpaper)
);

module.exports = router;
