const Wallpaper = require("../models/wallpaper");
const Comment = require("../models/comment");

module.exports.addComment = async (req, res) => {
  let wallpaper = await Wallpaper.findById(req.params.id);
  let newComment = new Comment(req.body.comment);
  newComment.author = req.user._id;
  wallpaper.comments.push(newComment);

  await newComment.save();
  await wallpaper.save();

  req.flash("success", "Comment added successfully!");
  res.redirect(`/wallpapers/${wallpaper._id}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  let deletedComm = await Comment.findByIdAndDelete(commentId);

  if (!deletedComm) {
    req.flash("error", "Comment not found!");
    return res.redirect(`/wallpapers/${id}`);
  }

  await Wallpaper.findByIdAndUpdate(id, { $pull: { comments: commentId } });

  req.flash("deleted", "Comment removed successfully.");
  res.redirect(`/wallpapers/${id}`);
};
