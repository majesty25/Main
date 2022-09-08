const mongoose = require("mongoose");
const connection = require("../util/database");

const items = new mongoose.Schema(
  {
    itemId: {
      type: String,
    },
    name: {
      type: String,
    },
    pic: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    off: {
      type: Number,
    },
    category: {
      type: String,
    },
    rate: {
      type: Number,
    },
    stars: {
      type: Number,
    },
    location: {
      type: String,
    },
    varieties: {}
  },
  // { _id: false }
);

const Item = connection.model("Item", items);

module.exports = Item;
