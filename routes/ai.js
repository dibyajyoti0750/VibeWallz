const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const aiController = require("../controllers/ais");

router.get("/", isLoggedIn, aiController.renderAiForm);

router.post("/generate", isLoggedIn, wrapAsync(aiController.generateImage));

module.exports = router;
