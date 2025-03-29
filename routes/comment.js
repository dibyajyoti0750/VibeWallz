const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Comment = require("../models/comment");
const Wallpaper = require("../models/wallpaper");
const { validateComment } = require("../middleware");

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

    req.flash("success", "Comment added successfully!");
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
      req.flash("error", "Comment not found!");
      return res.redirect(`/wallpapers/${id}`);
    }

    req.flash("deleted", "Comment removed successfully.");
    res.redirect(`/wallpapers/${id}`);
  })
);

module.exports = router;
