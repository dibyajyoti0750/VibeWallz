const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const wallpapers = require("./routes/wallpaper");
const comments = require("./routes/comment");
const ai = require("./routes/ai");

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

app.use("/wallpapers", wallpapers);
app.use("/wallpapers/:id/comments", comments);
app.use("/ai", ai);

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
