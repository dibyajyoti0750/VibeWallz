const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const cloudinary = require("../cloudConfig");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateWallpaper } = require("../middleware");
const wallpaperController = require("../controllers/wallpapers");

router
  .route("/")
  .get(wrapAsync(wallpaperController.index))
  // .post(
  //   isLoggedIn,
  //   validateWallpaper,
  //   wrapAsync(wallpaperController.uploadWallpaper)
  // );
  .post(upload.single("wallpaper[image]"), async (req, res) => {
    const file = req.file;
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "VibeWallz",
    });

    res.send(result);
  });

router.post(
  "/:id/like",
  isLoggedIn,
  wrapAsync(wallpaperController.likeWallpaper)
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
