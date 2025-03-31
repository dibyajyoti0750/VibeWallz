const Wallpaper = require("../models/wallpaper");

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
};

module.exports.deleteWallpaper = async (req, res) => {
  const { id } = req.params;
  let deletingWall = await Wallpaper.findByIdAndDelete(id);

  if (!deletingWall) {
    req.flash("error", "The wallpaper you're looking for doesn't exist!");
    return res.redirect("/wallpapers");
  }

  console.log(deletingWall);
  req.flash("deleted", "Wallpaper deleted successfully!");
  res.redirect("/wallpapers");
};
