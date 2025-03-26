const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/signup", (req, res) => {
  res.render("users/signup", { hideFooter: true });
});

router.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  let newUser = new User({ email, username });
  let registeredUser = await User.register(newUser, password);
  console.log(registeredUser);

  req.flash("success", "Signup successful! Welcome to VibeWallz.");
  res.redirect("/wallpapers");
});

module.exports = router;
