const mongoose = require("mongoose");
const connection = require("../util/database");

const order = new mongoose.Schema({
  orderId: {
    type: String,
  },
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
  },
  date: {
    type: String,
  },
  status: {
    type: String,
  },
});

const Order = connection.model("orders", order);

module.exports = Order;
