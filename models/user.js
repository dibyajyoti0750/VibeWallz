const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
