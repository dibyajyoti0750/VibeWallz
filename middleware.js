const Wallpaper = require("./models/wallpaper");
const ExpressError = require("./utils/ExpressError");
const { wallpaperSchema, commentSchema } = require("./schema");
const Comment = require("./models/comment");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("authError", "Please log in to continue.");

    // Detect if the request is an AJAX request
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res
        .status(401)
        .json({ error: "Unauthorized", redirectUrl: "/login" });
    }

    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let wallpaperDocument = await Wallpaper.findById(id);

  if (!wallpaperDocument.owner.equals(res.locals.currUser._id)) {
    req.flash("authError", "You are not the owner of this wallpaper.");
    return res.redirect(`/wallpapers/${id}`);
  }

  next();
};

module.exports.validateWallpaper = (req, res, next) => {
  let { error } = wallpaperSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateComment = (req, res, next) => {
  let { error } = commentSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isCommentAuthor = async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment.author.equals(res.locals.currUser._id)) {
    req.flash("authError", "You are not the author of this comment.");
    return res.redirect(`/wallpapers/${id}`);
  }
  next();
};
