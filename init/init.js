const mongoose = require("mongoose");
const { sampleData } = require("./data");
const Wallpaper = require("../models/wallpaper");

const MONGO_URL = "mongodb://127.0.0.1:27017/wallpaperswebsite";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await Wallpaper.deleteMany({});
    await Wallpaper.insertMany(sampleData);
    console.log("DB was initialized");

    mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
}

main();
