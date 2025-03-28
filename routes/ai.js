const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Wallpaper = require("../models/wallpaper");
const { GoogleGenAI } = require("@google/genai");
const { isLoggedIn } = require("../middleware");
const cloudinary = require("cloudinary").v2;
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

router.get("/", isLoggedIn, (req, res) => {
  return res.status(403).json({
    message: "I am still working on this feature. It will be live soon.",
  });

  /* res.render("ai/gen", { hideFooter: true }); */
});

router.post(
  "/generate",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    return res.status(403).json({
      message: "I am still working on this feature. It will be live soon.",
    });

    /*
    const { prompt } = req.body;

    if (!prompt) {
      req.flash("error", "Prompt is required!");
      return res.redirect("/ai");
    }

    const contents = `${prompt}. Please generate this image in a 9:16 vertical aspect ratio.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    let imgURL = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;

        const uploadResult = await cloudinary.uploader.upload(
          `data:image/png;base64,${imageData}`,
          { folder: "VibeWallz-AI" }
        );

        imgURL = uploadResult.secure_url;
      }
    }

    const aiWallpaper = new Wallpaper({
      title: prompt,
      description: "AI Generated Image",
      image: imgURL,
      category: "AI",
      tags: "AI",
    });

    await aiWallpaper.save();

    res.json(imgURL);
    */
  })
);

module.exports = router;
