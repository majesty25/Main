const express = require("express");
const app = express();
const ItemInfo = require("./classes.js");
// import {*} from "axios";
const session = require("express-session");
const Joi = require("joi");
const bodyParser = require("body-parser");
const socket = require("socket.io");
const Mailer = require("nodemailer");
const sqlite = require("sqlite3").verbose();
const path = require("path");
const { ItemDetailInfo } = require("./classes");
// const s = require("df");

const conn = new sqlite.Database("./majesty.db");
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
app.use(
  session({
    secret: "secret key",
    resave: true,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  const name = req.session.username;
  const id = req.session.ID;
  conn.all("SELECT * FROM item", (err, result) => {
    if (err) throw err;
    res.render("home", { result, name, id });
  });
});

app.get("/test", (req, res) => {
  let y = conn.all("SELECT * FROM item", (err, result) => {
    if (err) throw err;
    return result;
  });

  const ty = new ItemDetailInfo(y);
  res.send(ty.db(result));
});

app.post("/detail", (req, res) => {
  const id = req.body.id;
  const name = req.session.username;
  const address = req.session.address;
  conn.all(`SELECT * FROM item WHERE id = ${id}`, function (err, result) {
    conn.all(
      `SELECT * FROM review WHERE itemId = ${id}`,
      function (err, reviewOutput) {
        if (err) throw err;
        conn.all(
          `SELECT * FROM keyfeatures WHERE itemId = ${id}`,
          function (err, keyfeaturesOutput) {
            if (err) throw err;
            conn.all(
              `SELECT * FROM specifications WHERE itemId = ${id}`,
              function (err, specOutput) {
                if (err) throw err;
                conn.all(`SELECT * FROM users`, function (err, packageOutput) {
                  if (err) throw err;
                  conn.all(
                    `SELECT * FROM otherpics WHERE itemId = ${id}`,
                    function (err, otherpicsOutput) {
                      if (err) throw err;
                      res.render("detail", {
                        reviewOutput,
                        id,
                        result,
                        keyfeaturesOutput,
                        specOutput,
                        packageOutput,
                        otherpicsOutput,
                        name,
                        address,
                      });
                    }
                  );
                });
              }
            );
          }
        );
      }
    );
    if (err) throw err;
  });
});

app.get("/login", (req, res) => {
  if (req.session.username) {
    res.redirect("/");
  } else {
    const errorMessages = req.session.message;
    const logoutMessages = req.session.log;
    const id = req.session.ID;
    res.render("login", { errorMessages, logoutMessages });
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

app.post("/dashboard", async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const schema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string().pattern(new RegExp("^[A-zA-Z0-M]{3,30}$")).min(4),
  });
  const loginValidation = schema.validate(user);
  if (loginValidation.error) {
    const errorMessage = loginValidation.error.details[0].message;
    req.session.message = errorMessage;
    res.redirect("/login");
    console.log(loginValidation.error.details[0].message);
  } else {
    const sql = `SELECT * FROM users WHERE (email = '${user.email}' AND password = '${user.password}')`;
    conn.all(sql, (err, result) => {
      if (err) {
        throw err;
      } else if (Object.keys(result).length === 0) {
        req.session.log = "email and password do not match";
        res.redirect("/login");
      } else {
        Object.keys(result).forEach((key) => {
          let row = result[key];
          conn.all("SELECT * FROM item", (err, result) => {
            if (err) throw err;
            req.session.username = row.firstName + " " + row.lastName;
            req.session.address = `${row.region}, ${row.city}, ${row.resAddress}`;
            // let name = req.session.username;
            res.redirect("/");
          });
        });
      }
    });
  }
});

app.get("/dashboard", (req, res) => {
  res.redirect("/");
});

app.get("/cart", (req, res) => {
  const name = req.session.username;
  if (req.session.username) {
    res.render("cart", { name });
  } else {
    res.redirect("/login")
  }
  // const name = "Steve";
  
});

app.get("/my-orders", (req, res) => {
  if (req.session.username) {
    res.render("order");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", (req, res) => {
  const user = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    city: req.body.city,
    address: req.body.address,
    password: req.body.password,
  };
  const query = `SELECT * FROM user WHERE email`
})

app.get("/refer:id")


app.get("/search", (req, res) => {
  const name = req.session.username;
  // const name = "Steve";
  res.render("search");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// https://materialdesignicons.com/
