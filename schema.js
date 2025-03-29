const Joi = require("joi");

module.exports.wallpaperSchema = Joi.object({
  wallpaper: Joi.object({
    image: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    tags: Joi.alternatives()
      .try(
        Joi.string(), // Accepts a string if it's coming raw from the frontend
        Joi.array().items(Joi.string()) // Accepts an array after processing
      )
      .required(),

    location: Joi.string().required(),
    isFree: Joi.boolean(),
  }).required(),
});

module.exports.commentSchema = Joi.object({
  comment: Joi.object({
    text: Joi.string().required(),
  }).required(),
});
