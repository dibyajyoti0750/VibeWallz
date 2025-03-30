const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup", { hideFooter: true });
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    let newUser = new User({ email, username });
    let registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Signup successful. Welcome to VibeWallz!");
      res.redirect("/wallpapers");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login", { hideFooter: true });
};

module.exports.login = async (req, res) => {
  req.flash("success", "Login successful. Welcome back to VibeWallz!");
  let redirectUrl = res.locals.redirectUrl || "/wallpapers";
  res.redirect(redirectUrl);
};

module.exports.googleLogin = async (req, res) => {
  req.flash("success", "Login successful. Welcome to VibeWallz!");
  res.redirect("/wallpapers");
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out successfully.");
    res.redirect("/wallpapers");
  });
};
