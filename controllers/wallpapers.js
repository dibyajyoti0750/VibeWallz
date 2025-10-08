const Wallpaper = require("../models/wallpaper");
const cloudinary = require("../cloudConfig");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { filter } = req.query;

  let wallpapers;

  if (filter) {
    wallpapers = await Wallpaper.find({ category: filter }).sort({
      createdAt: -1,
    });
  } else {
    wallpapers = await Wallpaper.find({}).sort({ createdAt: -1 });
  }

  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json(wallpapers);
  } else {
    return res.render("wallpapers/index", { wallpapers });
  }
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

  // Only do this if a user is logged in
  if (req.user) {
    const userId = req.user._id;

    if (!wallpaper.viewdBy.includes(userId)) {
      wallpaper.views++;
      wallpaper.viewdBy.push(userId);
      await wallpaper.save();
    }
  }

  res.render("wallpapers/show", { wallpaper, mapToken: process.env.MAP_TOKEN });
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

  if (wallpaper.location) {
    // If location is provided, make the geocoding API call
    let response;
    try {
      response = await geocodingClient
        .forwardGeocode({
          query: wallpaper.location,
          limit: 2,
        })
        .send();
    } catch (error) {
      req.flash("error", "Error retrieving location data from Mapbox.");
      return res.redirect("/wallpapers/new");
    }

    // If location is not found, handle the case
    if (!response.body.features.length) {
      req.flash("error", "Location not found.");
      return res.redirect("/wallpapers/new");
    }

    // Set the location geometry from the geocoding result
    wallpaper.geometry = response.body.features[0].geometry;
  } else {
    // If no location is provided, use...
    wallpaper.geometry = { coordinates: [0, 0] }; // Default coordinates (or leave it undefined)
  }

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

  const savedWallpaper = await newWallpaper.save();
  console.log(savedWallpaper);

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

  let originalImageUrl = wallpaper.image.url;
  originalImageUrl = originalImageUrl.replace(
    "/upload/",
    "/upload/w_250,h_400,c_limit/"
  );

  res.render("wallpapers/edit", {
    wallpaper,
    originalImageUrl,
    hideFooter: true,
  });
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
