const Joi = require("joi");

module.exports.wallpaperSchema = Joi.object({
  wallpaper: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    tags: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .required(),
    location: Joi.string().optional().allow(""),
    isFree: Joi.boolean(),
    // Removed `image` — since it's added later by controller
  }).required(),
});

module.exports.commentSchema = Joi.object({
  comment: Joi.object({
    text: Joi.string().required(),
  }).required(),
});
