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
    type: String,
  },
  variety: {
    type: String,
    default: "default",
  },
});

const Cart = connection.model("cart", cart);

module.exports = Cart;
