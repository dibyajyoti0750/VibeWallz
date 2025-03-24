const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Wallpaper = require("./models/wallpaper");
const Comment = require("./models/comment");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { wallpaperSchema, commentSchema } = require("./schema");

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

const validateWallpaper = (req, res, next) => {
  let { error } = wallpaperSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateComment = (req, res, next) => {
  let { error } = commentSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

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

// AI
app.get("/wallpapers/ai", (req, res) =>
  res.status(200).send("<h1>Coming Soon...</h1>")
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

// Comment
app.post(
  "/wallpapers/:id/comment",
  validateComment,
  wrapAsync(async (req, res) => {
    let wallpaper = await Wallpaper.findById(req.params.id);
    let newComment = new Comment(req.body.comment);
    wallpaper.comments.push(newComment);
    await newComment.save();
    await wallpaper.save();
    res.redirect(`/wallpapers/${wallpaper._id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Internal Server Error!" } = err;
  res.status(statusCode).render("wallpapers/error", { statusCode, message });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
