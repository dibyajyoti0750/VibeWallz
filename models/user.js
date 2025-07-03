const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  imageGenerationCount: { type: Number, default: 0 },
  lastReset: { type: Date, default: () => Date.now() }, // each new user gets the correct timestamp when created
  isSubscribed: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
