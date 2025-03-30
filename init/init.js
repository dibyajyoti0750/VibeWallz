const mongoose = require("mongoose");
let { sampleData } = require("./data");
const Wallpaper = require("../models/wallpaper");

const MONGO_URL = "mongodb://127.0.0.1:27017/wallpaperswebsite";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
    await Wallpaper.deleteMany({});

    sampleData = sampleData.map((obj) => ({
      ...obj,
      owner: "67e986c39dc6880d3ebc35d5",
      location: "Howrah, West Bengal",
      isFree: true,
    }));

    await Wallpaper.insertMany(sampleData);
    console.log("DB was initialized");
    await mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
}

main();
