const Wallpaper = require("../models/wallpaper");
const cloudinary = require("../cloudConfig");

module.exports.index = async (req, res) => {
  const wallpapers = await Wallpaper.find({}).sort({ createdAt: -1 }); // Sorts in descending order (newest first)
  res.render("wallpapers/index", { wallpapers });
};

module.exports.renderNewForm = (req, res) => {
  res.render("wallpapers/new", { hideFooter: true });
};

module.exports.showWallpaper = async (req, res) => {
  const { id } = req.params;
  const wallpaper = await Wallpaper.findById(id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!wallpaper) {
    req.flash("error", "The wallpaper you're looking for doesn't exist!");
    return res.redirect("/wallpapers");
  }

  res.render("wallpapers/show", { wallpaper });
};

module.exports.likeWallpaper = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  let wallpaper = await Wallpaper.findById(id);

  let index = wallpaper.likes.indexOf(userId);

  if (index === -1) {
    wallpaper.likes.push(userId);
  } else {
    wallpaper.likes.splice(index, 1);
  }

  await wallpaper.save();

  res.status(200).json({ success: true, likes: wallpaper.likes.length });
};

module.exports.uploadWallpaper = async (req, res, next) => {
  const { wallpaper } = req.body;

  // Validate file upload
  if (!req.file) {
    req.flash("error", "Image is required!");
    return res.redirect("/wallpapers/new");
  }

  const file = req.file;
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "VibeWallz",
  });

  const imageData = {
    url: result.secure_url,
    filename: result.public_id,
  };

  // Format tags
  let formattedTags = [];
  if (typeof wallpaper.tags === "string") {
    formattedTags = wallpaper.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag, index, self) => tag && self.indexOf(tag) === index);
  }

  // Determine isFree
  const setIsFree = wallpaper.isFree === undefined ? false : true;

  // Create new wallpaper doc
  const newWallpaper = new Wallpaper({
    ...wallpaper,
    tags: formattedTags,
    isFree: setIsFree,
    owner: req.user._id,
    image: imageData,
  });

  await newWallpaper.save();

  req.flash("success", "Wallpaper uploaded successfully!");
  res.redirect("/wallpapers");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const wallpaper = await Wallpaper.findById(id);

  if (!wallpaper) {
    req.flash("error", "The wallpaper you're looking for doesn't exist!");
    return res.redirect("/wallpapers");
  }

  res.render("wallpapers/edit", { wallpaper, hideFooter: true });
};

module.exports.updateWallpaper = async (req, res) => {
  const { id } = req.params;
  const { wallpaper } = req.body;

  let setIsFree = wallpaper.isFree === undefined ? false : true;

  let formattedTags = [];
  if (typeof wallpaper.tags === "string") {
    formattedTags = wallpaper.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag, index, self) => tag !== "" && self.indexOf(tag) === index);
  }

  const existingWallpaper = await Wallpaper.findById(id);

  // If a new image is uploaded
  if (req.file) {
    // Delete the old image from Cloudinary
    if (existingWallpaper.image && existingWallpaper.image.filename) {
      await cloudinary.uploader.destroy(existingWallpaper.image.filename);
    }

    // Upload the new image
    const file = req.file;
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "VibeWallz",
    });

    // Update image info
    wallpaper.image = {
      url: result.secure_url,
      filename: result.public_id,
    };
  }

  // Perform update
  const updatedWallpaper = await Wallpaper.findByIdAndUpdate(
    id,
    {
      ...wallpaper,
      tags: formattedTags,
      isFree: setIsFree,
    },
    { new: true }
  );

  req.flash("success", "Wallpaper updated successfully!");
  res.redirect(`/wallpapers/${id}`);
};

module.exports.deleteWallpaper = async (req, res) => {
  const { id } = req.params;
  const deletingWall = await Wallpaper.findById(id);

  if (!deletingWall) {
    req.flash("error", "The wallpaper you're looking for doesn't exist!");
    return res.redirect("/wallpapers");
  }

  // Delete the image from Cloudinary
  if (deletingWall.image && deletingWall.image.filename) {
    await cloudinary.uploader.destroy(deletingWall.image.filename);
  }

  // Delete the document from MongoDB
  await Wallpaper.findByIdAndDelete(id);

  req.flash("deleted", "Wallpaper deleted successfully!");
  res.redirect("/wallpapers");
};
