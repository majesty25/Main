const mongoose = require("mongoose");
const connection = require("../util/database");

const users = new mongoose.Schema({
  userId: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  region: {
    type: String,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  password: {
    type: String,
  },
});

const Users = connection.model("Users", users);

module.exports = Users;
