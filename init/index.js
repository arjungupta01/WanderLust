const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
main()
  .then((res) => {
    console.log("connectde to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

const initDB = async () => {
  //cleaning the data base
  await Listing.deleteMany({});

  //listing owner into data
  initData.data=initData.data.map((obj)=>({...obj,owner:'67cb00a1c0230bbf0bb61e98'}))

  //inserting data into the database
  await Listing.insertMany(initData.data);
  console.log("Data was initalised");
};
initDB();
