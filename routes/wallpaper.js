const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateWallpaper } = require("../middleware");
const wallpaperController = require("../controllers/wallpapers");

router
  .route("/")
  .get(wrapAsync(wallpaperController.index))
  .post(
    isLoggedIn,
    validateWallpaper,
    wrapAsync(wallpaperController.uploadWallpaper)
  );

router.get("/new", isLoggedIn, wallpaperController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(wallpaperController.showWallpaper))
  .put(
    isLoggedIn,
    isOwner,
    validateWallpaper,
    wrapAsync(wallpaperController.updateWallpaper)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(wallpaperController.deleteWallpaper));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(wallpaperController.renderEditForm)
);

module.exports = router;
