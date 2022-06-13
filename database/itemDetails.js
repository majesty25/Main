const mongoose = require("mongoose");
const connection = require("../util/database");

const items = new mongoose.Schema({
  shipping: {
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const ItemDetail = connection.model("ItemDetail", item_detail);

module.exports = ItemDetail;
