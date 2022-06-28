const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Joi = require("joi");
const bodyParser = require("body-parser");
const sqlite = require("sqlite3").verbose();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const Items = require("./database/items");
const Saved = require("./database/saved");
const Cart = require("./database/cart");
const Customer = require("./util/classes/User");
const uid = require("./util/classes/uid");
const Users = require("./database/users");
// var url ="mongodb+srv://STEPHENNYANKSON:tvvq8KSYSuN4vWXi@cluster0.j5vgn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var url = "mongodb://127.0.0.1:27017";

const conn = new sqlite.Database("./majesty.db");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
const port = process.env.PORT || 3000;
app.use(
  session({
    secret: "secret key",
    resave: true,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");
app.use(cookieParser());

app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/font", express.static(path.resolve(__dirname, "assets/images")));
app.use(
  "/font-awsome-icons",
  express.static(path.resolve(__dirname, "assets/fontawesome-free-5.13.0-web"))
);
app.use(
  "/material-icons",
  express.static(
    path.resolve(__dirname, "assets/MaterialDesign-Webfont-master")
  )
);

const item = [
  {
    id: 1,
    name: "name 1",
    price: 336.0,
    pic: "lap4.jpg",
  },
  {
    id: 1,
    name: "name 2",
    price: 136.0,
    pic: "shu1.jpg",
  },
  {
    id: 1,
    name: "name 3",
    price: 876.0,
    pic: "56.jpg",
  },
  // {
  //   id: 1,
  //   name: "name 1",
  //   price: 336,
  //   pic: "51.jpg",
  // },
];

const items = [
  {
    id: 1,
    name: "name 1",
    price: 336.0,
    pic: "lap4.jpg",
  },
  {
    id: 1,
    name: "name 2",
    price: 136.0,
    pic: "shu1.jpg",
  },
  {
    id: 1,
    name: "name 3",
    price: 876.0,
    pic: "56.jpg",
  },
  {
    id: 1,
    name: "name 1",
    price: 336,
    pic: "51.jpg",
  },
];

const items2 = [
  {
    id: 1,
    name: "name 1",
    price: 336.0,
    pic: "shu2.jpg",
  },
  {
    id: 1,
    name: "name 2",
    price: 136.0,
    pic: "45.jpg",
  },
  {
    id: 1,
    name: "name 3",
    price: 876.0,
    pic: "54.jpg",
  },
  {
    id: 1,
    name: "name 1",
    price: 336,
    pic: "53.jpg",
  },
];

app.get("/", async (req, res) => {
  const isUser = req.session.username;
  const id = req.session.ID;
  const userId = req.session.userId;
  const email = req.session.email;
  let count;
  if (userId) {
    const customer = new Customer(userId);
    count = await customer.myCarts();
  }
  const ITEMS = await Items.find();
  res.render("home", {
    ITEMS,
    userId,
    id,
    email,
    item,
    items,
    items2,
    count,
  });
});

let user = {
  name: "John",
  age: 32,
};

app.post("/", async (req, res) => {
  const name = req.session.username;
  const userId = req.session.userId;
  const id = req.session.ID;
  // const cat = req.body.cat;
  const email = req.session.email;
  const item = req.body.cat;
  const itNameArr = item.split(" ");
  const itNameLast = itNameArr[itNameArr.length - 1];
  const itNameFirst = itNameArr[0];

  const query1 = `SELECT SUM(quantity) as total FROM cart
                  WHERE userId = '${userId}'`;

  conn.all(query1, [], (ERR, carts) => {
    // console.log(carts)
    conn.all(
      `SELECT * FROM item WHERE 
    (category = '${item}') OR name LIKE '%${item}%' OR name LIKE '%${itNameFirst}%' OR name LIKE '%${itNameLast}%'`,
      async (err, result) => {
        if (err) throw err;
        console.log(result);
        res.render("category", {
          result,
          name,
          id,
          email,
          carts,
        });
      }
    );
  });
});

app.post("/det", async (req, res) => {
  const itemId = req.body.id;
  const userId = req.session.userId;
  var savedItems = await Saved.findOne({ itemId, userId });
  let count;
  if (userId) {
    const customer = new Customer(userId);
    count = await customer.myCarts();
  }

  if (savedItems === null) {
    var output = "mdi-cards-heart-outline";
  } else {
    var output = "mdi-cards-heart";
  }

  const item = await Items.find({ itemId: `${itemId}` });
  const items = await Items.find();
  res.render("details", { item, items, count, output, userId });
});

app.post("/detail", async (req, res) => {
  const id = await req.body.id;
  const name = req.session.username;
  const userId = req.session.userId;
  const address = req.session.address;
  const email = req.session.email;
  const today1 = new Date();
  const today2 = new Date();
  const currentDay1 = today1.getDate();
  const currentDay2 = today2.getDate();
  today1.setDate(currentDay1 + 3);
  today2.setDate(currentDay2 + 8);
  const startDate = `${today1.toDateString().slice(0, 10)}`;
  const endDate = `${today2.toDateString().slice(0, 10)}`;
  const shcema = Joi.object({
    ID: Joi.number().integer().required(),
  });

  const result = await Items.find({ _id: req.body.id });
  console.log(result);

  const spec = ["red", "blue"];
  // const keyFeat = data.specifications.split(",");
  const keyFeat = ["Fbrication: leather"];
  // const otherPics = data.otherpics.split(", ");
  const otherPics = ["5.jpg"];

  Object.keys(result).forEach((key) => {
    let data = result[key].toJSON();
    // let variety = data.varieties.split(",");
    let variety = ["red", "blue"];
    console.log(variety);
    if (variety == "default") {
      res.render("detail", {
        result,
        id,
        spec,
        keyFeat,
        otherPics,
        startDate,
        endDate,
        // carts,
        address,
        items,
        email,
        name,
      });
    } else {
      res.render("detail", {
        variety,
        result,
        id,
        spec,
        keyFeat,
        otherPics,
        startDate,
        endDate,
        // carts,
        address,
        items,
        email,
        name,
      });
    }
  });
});

app.post("/add-cart", async (req, res) => {
  const Id = req.body.id;
  const userId = req.session.userId;
  const customer = new Customer(userId);
  const item = await Cart.findOne({ itemId: Id, userId });
  console.log(item);
  if (item === null) {
    console.log("Null");
    customer.addCart(Id, 1, "red");
  } else {
    console.log("Not null");
  }

  res.redirect("/cart");
});

app.post("/delete-cart", async (req, res) => {
  try {
    const Id = req.body.id;
    const userId = req.session.userId;
    await Cart.deleteOne({ itemId: Id, userId: userId });
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("/cart");
  }
});

app.post("/increase-cart", async (req, res) => {
  try {
    const itemId = req.body.id;
    const userId = req.session.userId;
    const item = await Cart.findOne({ itemId, userId });
    const initialQuantity = item.quantity;
    const newQuantiy = initialQuantity + 1;
    console.log(initialQuantity);
    await Cart.findOneAndUpdate({ itemId, userId }, { quantity: newQuantiy });
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("cart");
  }
});

app.post("/decrease-cart", async (req, res) => {
  try {
    const itemId = req.body.id;
    const userId = req.session.userId;
    const item = await Cart.findOne({ itemId, userId });
    const initialQuantity = item.quantity;
    if (initialQuantity >= 2) {
      const newQuantity = initialQuantity - 1;
      await Cart.findOneAndUpdate(
        { itemId, userId },
        { quantity: newQuantity }
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("cart");
  }
});

app.get("/login", (req, res) => {
  if (req.session.username) {
    res.redirect("/");
  } else {
    const errorMessages = req.session.message;
    const logoutMessages = req.session.log;
    const id = req.session.ID;
    res.render("login", {
      errorMessages,
      logoutMessages,
    });
  }
});

app.get("/signup", (req, res) => {
  req.session.destroy();
  res.render("signup");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/account", (req, res) => {
  const userId = req.session.userId;
  const name = req.session.username;

  if (req.session.username) {
    const query = `SELECT * FROM users WHERE id = '${userId}'`;
    const query1 = `SELECT SUM(quantity) as total FROM cart
                    WHERE userId = '${userId}'`;
    conn.all(query, (err, result) => {
      if (err) {
        throw err;
      } else {
        conn.all(query1, (error, carts) => {
          if (error) {
            throw error;
          } else {
            res.render("account", {
              result,
              name,
              userId,
              carts,
            });
          }
        });
      }
      //  res.render("account", { result, name, userId });
    });
  } else {
    res.redirect("/login");
  }

  // res.render("account", {});
});

app.get("/orders", (req, res) => {
  const name = req.session.username;
  const userId = req.session.userId;
  const random = Math.random() * 10000000000000;
  const orderId = Math.floor(random);
  const date = new Date();
  const dataFormatted = date.toLocaleDateString();

  const selectQuery = `SELECT * FROM cart WHERE userId = '${userId}'`;

  try {
    conn.all(selectQuery, (err, carts) => {
      if (err) {
        throw err;
      } else {
        Object.keys(carts).forEach((key) => {
          const cart = carts[key];
          const insertQuery = `INSERT INTO orders(itemId, orderId, userId, date, quantity, variety)
                             VALUES(${cart.itemId}, '${orderId}', ${userId}, '${dataFormatted}', ${cart.quantity}, '${cart.variety}')`;
          conn.run(insertQuery, [], (err) => {
            if (err) {
              throw err;
            } else {
              console.log("Inserted!");
            }
          });
        });
      }
    });
  } catch (error) {
  } finally {
    res.redirect("/my-orders");
  }

  // console.log(dataFormatted);
});

app.post("/dashboard", async (req, res) => {
  const body = req.body;
  const email = body.email;
  const password = body.password;
  const customer = new Customer(email);
  const msg = await customer.login(password);
  if (msg[1] === true) {
    const user = msg[0];
    for (let i in user) {
      const USER = user[i];
      req.session.userId = USER.userId;
      req.session.email = USER.email;
      req.session.username = USER.firstName + " " + USER.lastName;
    }
  } else {
    const errorMessages = msg;
    res.render("login", { errorMessages });
  }
  console.log(msg[1]);

  res.redirect("/");
});

app.get("/dashboard", (req, res) => {
  res.redirect("/");
});

app.get("/cart", async (req, res) => {
  const name = req.session.username;
  const email = req.session.email;
  const userId = req.session.userId;
  if (req.session.username) {
    const customer = new Customer(userId);
    let count;
    count = await customer.myCarts();
    const items = await Items.find();
    // }
    MongoClient.connect(url, (error, db) => {
      if (error) throw error;
      var dbo = db.db("nyankie");
      dbo
        .collection("carts")
        .aggregate([
          {
            $lookup: {
              from: "items",
              localField: "itemId",
              foreignField: "itemId",
              as: "cartdetails",
            },
          },
          {
            $match: { userId },
          },
        ])
        .toArray((err, cart) => {
          if (err) throw err;
          res.render("cart", { cart, count, userId, items });
          db.close();
        });
    });
  } else {
    res.redirect("/login");
  }

  // const name = "Steve";
});

app.post("/cart-one", async (req, res) => {
  const name = req.session.username;
  const email = req.session.email;
  const userId = req.session.userId;

  if (req.session.username) {
    const customer = new Customer(userId);
    let count;
    count = await customer.myCarts();
    const items = await Items.find();

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("nyankie");
      dbo
        .collection("carts")
        .aggregate([
          {
            $lookup: {
              from: "items",
              localField: "itemId",
              foreignField: "itemId",
              as: "cartdetails",
            },
          },
          {
            $match: { userId: 6 },
          },
        ])
        .toArray(function (err, cart) {
          if (err) throw err;

          console.log(cart);
          res.render("cart1", { cart, count, items });
          db.close();
        });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  return;
});

app.post("/save", async (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const itemId = req.body.id;
    var savedItems = await Saved.findOne({ itemId, userId });
    const items = await Items.find();
    let count;
    if (userId) {
      const customer = new Customer(userId);
      customer.saveItem(itemId);

      count = await customer.myCarts();
    }
    if (savedItems === null) {
      var output = "mdi-cards-heart";
    } else {
      var output = "mdi-cards-heart-outline";
    }

    const item = await Items.find({ itemId: `${itemId}` });
    res.render("details", { item, items, count, output, userId });
  } else {
    res.redirect("/login");
  }
});

app.get("/saved", async (req, res) => {
  const userId = req.session.userId;
  if (req.session.username) {
    const customer = new Customer(userId);
    let count;
    const items = await Items.find();
    if (userId) {
      const customer = new Customer(userId);
      count = await customer.myCarts();
    }
    MongoClient.connect(url, (error, db) => {
      if (error) throw error;
      var dbo = db.db("nyankie");
      dbo
        .collection("saveds")
        .aggregate([
          {
            $lookup: {
              from: "items",
              localField: "itemId",
              foreignField: "itemId",
              as: "cartdetails",
            },
          },
          {
            $match: { userId },
          },
        ])
        .toArray((err, cart) => {
          if (err) throw err;
          res.render("saved", { cart, items, count, userId });
          db.close();
        });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/cat", async (req, res) => {
  const name = req.session.username;
  const userId = req.session.userId;
  const query = `SELECT SUM(I.price) AS totalPrice, SUM(quantity) as total
                 FROM cart C
                 JOIN item I
                 ON C.itemId = I.id
                 WHERE C.userId = '${userId}'`;

  const query1 = `SELECT SUM(quantity) as total FROM cart
                  WHERE userId = '${userId}'`;

  if (req.session.username) {
    await conn.all(query, async (err, results) => {
      if (err) {
        throw err;
      } else {
        res.render("cartSum", {
          name,
          results,
          err,
        });

        console.log(results);
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/my-carts", (req, res) => {
  res.render("cart1");
});

app.get("/my-orders", async (req, res) => {
  const items = await Items.find();
  if (req.session.username) {
    res.render("order", { items });
  } else {
    res.redirect("/login");
  }
});

app.get("/add-item", (req, res) => {
  res.render("addItem");
});

app.post("/add-item", (req, res) => {
  const userId = req.session.userId;
  const ID = uid();
  const customer = new Customer(userId);
  const item = req.body;
  customer.addItem(
    ID,
    item.name,
    item.description,
    item.pic,
    item.price,
    item.discount,
    item.category,
    item.rate,
    item.stars,
    item.location
  );

  console.log(item);
  res.redirect("/add-item");
});

app.post("/register", async (req, res) => {
  try {
    const userId = uid();
    const user = req.body;
    const customer = new Customer(userId);
    var msg = customer.register(
      user.fname,
      user.lname,
      user.email,
      user.phone,
      user.password,
      user.repPassword
    );
  } catch (error) {
    throw error;
  } finally {
    if (msg === true) {
      res.redirect("/login");
    } else {
      res.render("signup", { msg });
    }
  }
});

app.get("/search", (req, res) => {
  const name = req.session.username;

  res.render("search");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// https://materialdesignicons.com/
