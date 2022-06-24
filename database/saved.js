const mongoose = require("mongoose");
const connection = require("../util/database");

const saveds = new mongoose.Schema({
  itemId: {
    type: String,
  },
  userId: {
    type: String,
  },
});

const Saved = connection.model("saveds", saveds);

module.exports = Saved;
