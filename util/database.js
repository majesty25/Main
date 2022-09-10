const mongoose = require("mongoose");
let url ="mongodb+srv://STEPHENNYANKSON:tvvq8KSYSuN4vWXi@cluster0.j5vgn.mongodb.net/nyankie?retryWrites=true&w=majority";
// let url = "mongodb://127.0.0.1:27017/nyankie";
const connection = mongoose.createConnection(
  url
);


module.exports = connection;
