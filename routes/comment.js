const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { commentSchema } = require("../schema");
const Comment = require("../models/comment");
const Wallpaper = require("../models/wallpaper");

const validateComment = (req, res, next) => {
  let { error } = commentSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Comment
router.post(
  "/",
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

// Destroy Comment
router.delete(
  "/:commentId",
  wrapAsync(async (req, res) => {
    const { id, commentId } = req.params;

    await Wallpaper.findByIdAndUpdate(id, { $pull: { comments: commentId } });

    let deletedComm = await Comment.findByIdAndDelete(commentId);

    if (!deletedComm) {
      throw new ExpressError(404, "Comment not found!");
    }

    res.redirect(`/wallpapers/${id}`);
  })
);

module.exports = router;
