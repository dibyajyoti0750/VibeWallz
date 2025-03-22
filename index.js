const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Wallpaper = require("./models/wallpaper");
const path = require("path");
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wallpaperswebsite";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/wallpapers");
});

// Index
app.get("/wallpapers", async (req, res) => {
  const wallpapers = await Wallpaper.find({});
  res.render("wallpapers/index", { wallpapers });
});

// New
app.get("/wallpapers/new", (req, res) => {
  res.render("wallpapers/new");
});

// Create
app.post("/wallpapers", async (req, res) => {
  const { image, title, description, category, tags } = req.body.wallpaper;

  const newWallpaper = new Wallpaper({
    image,
    title,
    description,
    category,
    tags: tags.split(",").map((tag) => tag.trim()),
  });

  await newWallpaper.save();
  res.redirect("/wallpapers");
});

// Show
app.get("/wallpapers/:id", async (req, res) => {
  const { id } = req.params;
  const wallpaper = await Wallpaper.findById(id);
  res.render("wallpapers/show", { wallpaper });
});

// Edit
app.get("/wallpapers/:id/edit", async (req, res) => {
  const { id } = req.params;
  const wallpaper = await Wallpaper.findById(id);
  res.render("wallpapers/edit", { wallpaper });
});

// Update
app.put("/wallpapers/:id", async (req, res) => {
  const { id } = req.params;
  const { image, title, description, category, tags } = req.body.wallpaper;
  const formattedTags = tags.split(",").map((tag) => tag.trim());

  await Wallpaper.findByIdAndUpdate(id, {
    image,
    title,
    description,
    category,
    tags: formattedTags,
  });

  res.redirect("/wallpapers");
});

// Destroy
app.delete("/wallpapers/:id", async (req, res) => {
  const { id } = req.params;
  let del = await Wallpaper.findByIdAndDelete(id);
  res.redirect("/wallpapers");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
