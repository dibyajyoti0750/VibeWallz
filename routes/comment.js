const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Comment = require("../models/comment");
const Wallpaper = require("../models/wallpaper");
const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../middleware");

// Comment
router.post(
  "/",
  isLoggedIn,
  validateComment,
  wrapAsync(async (req, res) => {
    let wallpaper = await Wallpaper.findById(req.params.id);
    let newComment = new Comment(req.body.comment);
    newComment.author = req.user._id;
    wallpaper.comments.push(newComment);

    await newComment.save();
    await wallpaper.save();

    req.flash("success", "Comment added successfully!");
    res.redirect(`/wallpapers/${wallpaper._id}`);
  })
);

// Destroy Comment
router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  wrapAsync(async (req, res) => {
    const { id, commentId } = req.params;

    let deletedComm = await Comment.findByIdAndDelete(commentId);

    if (!deletedComm) {
      req.flash("error", "Comment not found!");
      return res.redirect(`/wallpapers/${id}`);
    }

    await Wallpaper.findByIdAndUpdate(id, { $pull: { comments: commentId } });

    req.flash("deleted", "Comment removed successfully.");
    res.redirect(`/wallpapers/${id}`);
  })
);

module.exports = router;
