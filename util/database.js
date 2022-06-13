const mongoose = require("mongoose");
const connection = mongoose.createConnection(
  "mongodb://127.0.0.1:27017/nyankie"
);

module.exports = connection;
