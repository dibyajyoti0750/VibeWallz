module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    req.flash("authError", "Please log in to continue.");
    return res.redirect("/login");
  }
  next();
};
