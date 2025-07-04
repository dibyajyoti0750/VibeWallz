const { GoogleGenAI } = require("@google/genai");
const cloudinary = require("cloudinary").v2;
const Wallpaper = require("../models/wallpaper");
const User = require("../models/user");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

module.exports.renderAiForm = (req, res) => {
  /* return res.status(403).json({
    message: "I am still working on this feature. It will be live soon.",
  }); */

  res.render("ai/gen", { hideFooter: true, user: req.user });
};

module.exports.checkImageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const now = new Date();
    const lastReset = new Date(user.lastReset);

    const isSameDay =
      now.getFullYear() === lastReset.getFullYear() &&
      now.getMonth() === lastReset.getMonth() &&
      now.getDate() === lastReset.getDate();

    if (!isSameDay) {
      user.imageGenerationCount = 0;
      user.lastReset = now;
    }

    if (user.isSubscribed) {
      await user.save();
      return next();
    }

    if (user.imageGenerationCount >= 5) {
      return res.status(429).json({
        success: false,
        paymentRequired: true,
        message:
          "Daily image generation limit reached. Please subscribe to continue.",
      });
    }

    user.imageGenerationCount += 1;
    await user.save();

    next();
  } catch (error) {
    console.error("Error in image limit middleware:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports.generateImage = async (req, res) => {
  /* return res.status(403).json({
      message: "I am still working on this feature. It will be live soon.",
    }); */

  const { prompt } = req.body;

  if (!prompt) {
    req.flash("error", "Prompt is required!");
    return res.redirect("/ai");
  }

  // const contents = `${prompt}. Please generate this image in a 9:16 vertical aspect ratio.`;
  const contents = prompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp-image-generation",
    contents: contents,
    config: {
      responseModalities: ["Text", "Image"],
    },
  });

  let imgURL = null;
  let imgName = null;
  let imgDesc = null;

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
      imgDesc = part.text;
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageData}`,
        { folder: "VibeWallz-AI" }
      );

      imgURL = uploadResult.secure_url;
      imgName = uploadResult.public_id;
    }
  }

  const aiWallpaper = new Wallpaper({
    title: prompt,
    description: imgDesc,
    image: {
      url: imgURL,
      filename: imgName,
    },
    owner: req.user._id,
    location: "",
    isFree: true,
    category: "AI",
    tags: "AI",
  });

  await aiWallpaper.save();

  res.json(imgURL);
};

module.exports.sendImageGenerationCount = async (req, res) => {
  const user = await User.findById(req.user._id);
  const count = user.imageGenerationCount;
  res.json({
    success: true,
    data: count,
  });
};
