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
const groups = require("./util/data/groupData");
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

app.use(cookieParser());
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
  // {
  //   id: 1,
  //   name: "name 3",
  //   price: 876.0,
  //   pic: "56.jpg",
  // },
];

app.get("/", async (req, res) => {
  let cookies = req.cookies;
  req.session.userId = cookies.id;
  req.session.email = cookies.email;  
  const id = req.session.ID;
  const userId = req.session.userId;
  const email = req.session.email;
  let count;
  if (userId) {
    const customer = new Customer(userId);
    count = await customer.myCarts();
    var isUser = await req.session.userId;
  }
  const ITEMS = await Items.find();
  const items = await Items.find().limit(4);
  const items2 = await Items.find().limit(4);

  let m = [];

  for (let i in ITEMS) {
    let x = ITEMS[i];
    let y = x.name;
    let z = x.price;
    let id = x.itemId;
    let category = x.category;
    let location = x.location;
    let obj = {
      name: y,
      price: z,
      id,
      category,
      location,
    };
    m.push(obj);
  }
  console.table(m);

  res.render("home", {
    ITEMS,
    userId,
    id,
    email,
    item,
    items,
    items2,
    count,
    groups,
  });
});

app.post("/", async (req, res) => {
  const name = req.session.username;
  const userId = req.session.userId;
  const id = req.session.ID;
  const email = req.session.email;
  const item = req.body.cat;
  const itNameArr = item.split(" ");
  const itNameLast = itNameArr[itNameArr.length - 1];
  const itNameFirst = itNameArr[0];

  let count;
  if (userId) {
    const customer = new Customer(userId);
    count = await customer.myCarts();
  }
  const ITEMS = await Items.find({
    $or: [
      { category: new RegExp(item, "i") },
      { name: new RegExp(itNameFirst, "i") },
      { name: new RegExp(itNameLast, "i") },
    ],
  });

  res.render("category", {
    ITEMS,
    userId,
    id,
    email,
    count,
    groups,
  });
});

app.get("/food/:id", async (req, res) => {
  const isUser = req.session.username;
  const id = req.session.ID;
  const ID = req.params.id;
  const userId = req.session.userId;
  const email = req.session.email;
  let count;
  console.log(ID);
  if (userId) {
    const customer = new Customer(userId);
    count = await customer.myCarts();
  }
  // const ITEMS = await Items.find({ itemId: ID });
  const ITEMS = await Items.find();
  const items = await Items.find().limit(4);
  const items2 = await Items.find().limit(4);

  let m = [];

  for (let i in ITEMS) {
    let x = ITEMS[i];
    let y = x.name;
    let z = x.price;
    let id = x.itemId;
    let category = x.category;
    let location = x.location;
    let obj = {
      name: y,
      price: z,
      id,
      category,
      location,
    };
    m.push(obj);
  }
  console.table(m);

  res.render("food", {
    ITEMS,
    userId,
    id,
    email,
    item,
    items,
    items2,
    count,
    groups,
  });
});

app.post("/det", async (req, res) => {
  const itemId = req.body.id;
  const userId = req.session.userId;
  const today1 = new Date();
  const today2 = new Date();
  const currentDay1 = today1.getDate();
  const currentDay2 = today2.getDate();
  today1.setDate(currentDay1 + 5);
  today2.setDate(currentDay2 + 10);
  const startDate = `${today1.toDateString().slice(0, 10)}`;
  const endDate = `${today2.toDateString().slice(0, 10)}`;
  var savedItems = await Saved.findOne({ itemId, userId });
  let count, output, item, items;
  if (userId) {
    const customer = new Customer(userId);
    count = await customer.myCarts();
  }

  if (savedItems === null) {
    output = "mdi-cards-heart-outline";
  } else {
    output = "mdi-cards-heart";
  }

  item = await Items.find({ itemId: `${itemId}` });
  items = await Items.find();
  res.render("details", {
    item,
    items,
    count,
    output,
    userId,
    startDate,
    endDate,
  });
});

app.post("/add-cart", async (req, res) => {
  const Id = req.body.id;
  let variety = req.body.variety;
  // console.log(variety)
  const userId = req.session.userId;
  const customer = new Customer(userId);
  const item = await Cart.findOne({ itemId: Id, userId });
  console.log(item);
  if (item === null) {
    console.log("Null");
    customer.addCart(Id, 1, variety);
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
  res.clearCookie("id");
  res.clearCookie("email");
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/account", async (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    const user = await Users.find({ userId });
    console.log(user);
    res.render("account", { user });
  } else {
    res.redirect("/login");
  }
});

app.get("/orders", async (req, res) => {
  // const isUser = req.session.userId;
  const userId = req.session.userId;

  if (req.session.userId) {
    const customer = new Customer(userId);
    const carts = await customer.placeOrder();
    res.redirect("/my-orders");
  } else {
    res.redirect("/login");
  }
});

app.get("/payment", (req, res) => {
  res.render("payment");
});

app.post("/dashboard", async (req, res) => {
  const body = req.body;
  const email = body.email;
  const password = body.password;
  let today = new Date();
  let currentDay = today.getDate();
  const customer = new Customer(email);
  const msg = await customer.login(password);
  if (msg[1] === true) {
    const user = msg[0];
    for (let i in user) {
      const USER = user[i];
      req.session.userId = USER.userId;
      req.session.email = USER.email;
      let userID = USER.userId;
      let userEmail = USER.email;
      res.cookie("email", userEmail, {
        httpOnly: true,
        maxAge: 900000000000,
        // signed: true,
      });
      res.cookie("id", userID, {
        httpOnly: true,
        maxAge: 900000000000,
      });

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
  const isUser = req.session.userId;
  const email = req.session.email;
  const userId = req.session.userId;
  if (isUser) {
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
});

app.post("/cart-one", async (req, res) => {
  const isUser = req.session.userId;
  const email = req.session.email;
  const userId = req.session.userId;

  if (isUser) {
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
            $match: { userId },
          },
        ])
        .toArray(function (err, cart) {
          if (err) throw err;

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
    const today1 = new Date();
    const today2 = new Date();
    const currentDay1 = today1.getDate();
    const currentDay2 = today2.getDate();
    today1.setDate(currentDay1 + 5);
    today2.setDate(currentDay2 + 10);
    const startDate = `${today1.toDateString().slice(0, 10)}`;
    const endDate = `${today2.toDateString().slice(0, 10)}`;
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
    res.render("details", {
      item,
      items,
      count,
      output,
      userId,
      startDate,
      endDate,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/saved", async (req, res) => {
  const userId = req.session.userId;
  if (req.session.userId) {
    // const customer = new Customer(userId);
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

app.get("/my-carts", (req, res) => {
  res.render("cart1");
});

app.get("/my-orders", async (req, res) => {
  const isUser  = req.session.userId;
  const userId  = req.session.userId;
  const email = req.session.email; 
  if (isUser) {
    const customer = new Customer(userId);
    let count, check;
    count = await customer.myCarts();
    const items = await Items.find();
    // }
    MongoClient.connect(url, (error, db) => {
      if (error) throw error;
      var dbo = db.db("nyankie");
      dbo
        .collection("orders")
        .aggregate([
          {
            $lookup: {
              from: "items",
              localField: "itemId",
              foreignField: "itemId",
              as: "orderdetails",
            },
          },
          {
            $match: { userId },
          },
        ])
        .toArray((err, orders) => {
          if (err) throw err;
          if (orders === null) {
            check = false;
          } else {
            check = true;
          }
          console.log(orders);
          res.render("order", { orders, count, userId, items, check });
          db.close();
        });
    });
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
