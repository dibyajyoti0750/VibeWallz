const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Wallpaper = require("./models/wallpaper");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

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
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
  res.redirect("/wallpapers");
});

// Index
app.get(
  "/wallpapers",
  wrapAsync(async (req, res) => {
    const wallpapers = await Wallpaper.find({});
    res.render("wallpapers/index", { wallpapers });
  })
);

// New
app.get("/wallpapers/new", (req, res) => {
  res.render("wallpapers/new");
});

// Create
app.post(
  "/wallpapers",
  wrapAsync(async (req, res, next) => {
    if (!req.body.wallpaper) {
      throw new ExpressError(400, "Wallpaper data is required!");
    }

    const { image, title, description, category, tags } = req.body.wallpaper;
    const newWallpaper = new Wallpaper({
      image,
      title,
      description,
      category,
      tags: tags.split(",").map((tag) => tag.trim()),
    });

    const savedWallpaper = await newWallpaper.save();
    console.log(savedWallpaper);

    res.redirect("/wallpapers");
  })
);

// Show
app.get(
  "/wallpapers/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id);

    if (!wallpaper) {
      throw new ExpressError(404, "Wallpaper not found!");
    }

    res.render("wallpapers/show", { wallpaper });
  })
);

// Edit
app.get(
  "/wallpapers/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id);

    if (!wallpaper) {
      throw new ExpressError(404, "Wallpaper not found!");
    }

    res.render("wallpapers/edit", { wallpaper });
  })
);

// Update
app.put(
  "/wallpapers/:id",
  wrapAsync(async (req, res) => {
    if (!req.body.wallpaper) {
      throw new ExpressError(400, "Wallpaper data is required!");
    }

    const { id } = req.params;
    const { image, title, description, category, tags } = req.body.wallpaper;
    const formattedTags = tags.split(",").map((tag) => tag.trim());
    const updatedWallpaper = await Wallpaper.findByIdAndUpdate(
      id,
      {
        image,
        title,
        description,
        category,
        tags: formattedTags,
      },
      { new: true }
    );
    console.log(updatedWallpaper);
    res.redirect("/wallpapers");
  })
);

// Destroy
app.delete(
  "/wallpapers/:id",
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

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
