const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const aiController = require("../controllers/ais");

router.get("/", isLoggedIn, aiController.renderAiForm);

router.post(
  "/generate",
  isLoggedIn,
  aiController.checkImageLimit,
  wrapAsync(aiController.generateImage)
);

router.get(
  "/generation-count",
  isLoggedIn,
  aiController.sendImageGenerationCount
);

module.exports = router;
