const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const commentController = require("../controllers/comments");
const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateComment,
  wrapAsync(commentController.addComment)
);

router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  wrapAsync(commentController.deleteComment)
);

module.exports = router;
