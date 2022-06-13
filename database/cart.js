const mongoose = require("mongoose");
const connection = require("../util/database");

const cart = new mongoose.Schema({
  itemId: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  variety: {
    type: String,
  },
});

const Cart = connection.model("cart", cart);

module.exports = Cart;
