const sqlite = require("sqlite3").verbose();
const conn = new sqlite.Database("./majesty.db");

class ItemDetailInfo {
  constructor(db) {
    this.db = db;

    console.log("this is a constructor function!");
  }

  items() {
    // function Database() {
    conn.all("SELECT * FROM item", (err, result) => {
      if (err) throw err;
      console.log(result);
    });
    // }

    // return Database;
  }
}

// let y = conn.all("SELECT * FROM item", (err, result) => {
//   if (err) throw err;
//   // console.log(result);
// });

// const x = new ItemDetailInfo(y);
// console.log(x.db);

module.exports = { ItemDetailInfo };
// export { ItemDetailInfo };
