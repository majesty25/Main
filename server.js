const express = require("express");
const app = express();
const ItemInfo = require("./classes.js");
var requestIp = require("request-ip");
// import {*} from "axios";
const axios = require("axios");
const session = require("express-session");
const Joi = require("joi");
const bodyParser = require("body-parser");
const socket = require("socket.io");
const nodemailer = require("nodemailer");
const sqlite = require("sqlite3").verbose();
const path = require("path");

const os = require("os");
const interfaces = os.networkInterfaces();

const conn = new sqlite.Database("./majesty.db");
app.use(
  bodyParser.urlencoded({
    extended: true,
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


const items = [
  {
    id: 1,
    name: "name 1",
    price: 336.00,
    pic: "lap4.jpg",
  },
  {
    id: 1,
    name: "name 2",
    price: 136.00,
    pic: "shu1.jpg",
  },
  {
    id: 1,
    name: "name 3",
    price: 876.00,
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
  const name = req.session.username;
  const id = req.session.ID;
  const userId = req.session.userId;
  const email = req.session.email;
  const query1 = `SELECT SUM(quantity) as total FROM cart
                  WHERE userId = '${userId}'`;
  // var idAddress = req.connection.remoteAddress;
  //   console.log(idAddress); // Find IP Address

    var clientIp = requestIp.getClientIp(req);
  console.log(clientIp);
  


  
let addresses = [];

for (var k in interfaces) {
  for (var k2 in interfaces[k]) {
    const address = interfaces[k][k2];

    if (
      (address.family === "IPv4" || address.family === "IPv6") &&
      !address.internal
    ) {
      addresses.push(address.address);
      const insert = `INSERT INTO ip_address(ip) VALUES('${address.address}')`;
      conn.run(insert, [], (E) => {
        console.log(addresses);
      });
    }
  }
}
console.log(addresses);




  await conn.all("SELECT * FROM item", async (err, result) => {
    if (err) {
      throw err;
    } else {
      await conn.all(query1, (error, carts) => {
        if (error) {
          throw error;
        } else {
          const arr = ["a"];
          Object.keys(result).forEach((key) => {
            const n = result[key];
            arr.push(n.name);
          });
          // console.log(arr)
          res.render("home", {
            arr,
            result,
            name,
            id,
            carts,
            email,
            items,
            items2,
          });
        }
      });
    }
  });
});

app.post("/", async (req, res) => {
  const name = req.session.username;
  const userId = req.session.userId;
  const id = req.session.ID;
  // const cat = req.body.cat;
  const email = req.session.email;
  const item = req.body.cat;
  const itNameArr = item.split(" ")
  const itNameLast = (itNameArr[itNameArr.length-1])
  const itNameFirst = (itNameArr[0])

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
            carts
          });
        }
      );
  })

});

app.get("/test", (req, res) => {
  function ghana(err, result) {
    if (err) throw err;
    return result;
  }
  let y = conn.all("SELECT * FROM item");

  console.log(y);
});


app.post("/detail", async (req, res) => {
  const id = req.body.id;
  const itemId = { ID: id };
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
  const query1 = `SELECT * FROM item WHERE id = ${id}`;
  const query2 = `SELECT * FROM review WHERE itemId = ${id}`;
  const query4 = `SELECT * FROM item WHERE id < ?`;
  const query3 = `SELECT SUM(quantity) as total FROM cart
                  WHERE userId = '${userId}'`;

  const shcema = Joi.object({ ID: Joi.number().integer().required() });

  const idValidation = shcema.validate(itemId);
  if (idValidation.error) {
    console.log(idValidation.error.details.message);
    res.redirect("/help");
  } else {
    conn.all(query4, [9], (E, items) => {
      if (E) {
        throw E;
      } else {
            conn.all(query3, (error, carts) => {
              if (error) {
                throw error;
              } else {
                conn.all(query1, async (err, result) => {
                  if (err) {
                    res.redirect("/help");
                  } else {
                    Object.keys(result).forEach((key) => {
                      const data = result[key];
                      const variety = data.varieties;
                      const spec = data.specifications.split(",");
                      const keyFeat = data.specifications.split(",");
                      const otherPics = data.otherpics.split(", ");
                      if (variety == "default") {
                        res.render("detail", {
                          result,
                          id,
                          spec,
                          keyFeat,
                          otherPics,
                          startDate,
                          endDate,
                          carts,
                          address,
                          items,
                          email,
                        });
                      } else if (variety.length > 0) {
                        const varieties = variety.split(", ");
                        res.render("detail", {
                          result,
                          id,
                          varieties,
                          spec,
                          keyFeat,
                          otherPics,
                          startDate,
                          endDate,
                          carts,
                          address,
                          items,
                          email,
                        });
                      }
                    });
                  }
                });
              }
            });
      }
    });

  }
});

app.post("/add-cart", async (req, res) => {
  
  const itemId = await req.body.id;
  const sql = `SELECT id FROM item WHERE id = ?`

   conn.all(sql, [itemId], (ERROR, RESULT) => {
     if (ERROR) {
       console.log(ERROR);
     } else if (Object.keys(RESULT).length === 0) {
       console.log("Ivalid entery");
     } else {
         try {
           const variation =  req.body.color;

           const userId = req.session.userId;
           const query1 = `SELECT * FROM cart 
                    WHERE (itemId IN(${itemId}) AND userId IN(${userId}))`;
            conn.all(query1, async (err, results) => {
             if (err) {
               console.log(err);
             } else if (Object.keys(results).length === 0) {
               // INSERT INTO THE TABLE IF ITEM DOES NOT EXIST IN THE TABLE
               const query2 = `INSERT INTO cart (itemId, userId, quantity, variety) 
                        VALUES(${itemId}, ${userId}, 1, '${variation}')`;
               await conn.run(query2, [], (err) => {
                 if (err) {
                   console.log(err);
                 }
                 console.log(variation);
               });
               // conn.close();
             } else {
               try {
                 const query = `DELETE FROM cart 
                   WHERE (userId = '${userId}' AND itemId = '${itemId}')`;
                 // DELETE WHEN EXIST
                 conn.run(query, [], (errorMessage) => {
                   if (errorMessage) {
                     throw errorMessage;
                   } else {
                     console.log("Deleted!");
                   }
                 });
               } catch (error) {
               } finally {
                 const query4 = `INSERT INTO cart (itemId, userId, quantity, variety) 
                        VALUES(${itemId}, ${userId}, 1, '${variation}')`;
                 // REINSERT AFTER DELETED
                 conn.run(query4, [], (ERR) => {
                   if (ERR) {
                     throw ERR;
                   } else {
                     console.log("Inserted!");
                   }
                 });
                 // console.log("Item already exist in your carts!");
               }
             }
           });
         } catch (err) {
           console.log(err);
         } finally {
           res.redirect("/cart");
         }
     }
   });



});

app.post("/delete-cart", async (req, res) => {
  try {
    const itemId = req.body.id;
    const userId = req.session.userId;
    const query = `DELETE FROM cart 
                   WHERE (userId = '${userId}' AND itemId = '${itemId}')`;
    conn.run(query, [], (err) => {
      if (err) {
        throw err;
      } else {
        console.log("Deleted!");
      }
    });
  } catch (error) {
  } finally {
    res.redirect("/cart");
  }
});

app.post("/increase-cart", async (req, res) => {
  try {
    const itemId = req.body.id;
    const userId = req.session.userId;
    const selectQuery = `SELECT * FROM cart
                         WHERE (userId = '${userId}' AND itemId = '${itemId}')`;

    await conn.all(selectQuery, (err, result) => {
      if (err) {
        throw err;
      } else {
        Object.keys(result).forEach((key) => {
          const row = result[key];
          const qty = row.quantity;
          const query = `UPDATE cart SET quantity = ${qty + 1}
                         WHERE (userId = '${userId}' AND itemId = '${itemId}')`;
          conn.run(query, [], (error) => {
            if (error) {
              throw error;
            } else {
            }
          });
        });
      }
    });
  } catch (error) {
  } finally {
    res.redirect("/cart");
  }
});

app.post("/decrease-cart", async (req, res) => {
  try {
    const itemId = req.body.id;
    const userId = req.session.userId;
    const selectQuery = `SELECT * FROM cart
                         WHERE (userId = '${userId}' AND itemId = '${itemId}')`;

    await conn.all(selectQuery, (err, result) => {
      if (err) {
        throw err;
      } else {
        Object.keys(result).forEach((key) => {
          const row = result[key];
          const qty = row.quantity;
          if (qty > 1) {
            const query = `UPDATE cart SET quantity = ${qty - 1}
                         WHERE (userId = '${userId}' AND itemId = '${itemId}')`;
            conn.run(query, [], (error) => {
              if (error) {
                throw error;
              } else {
              }
            });
          }
        });
      }
    });
  } catch (error) {
  } finally {
    res.redirect("/cart");
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

app.get("/payment", (req, res) => {
  res.render("payment");
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
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
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
    const sql = "SELECT * FROM users WHERE (email = ? AND password = ?)";
    conn.all(sql, [`${user.email}`, `${user.password}`], (err, result) => {
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
            req.session.userId = row.id;
            req.session.email = row.email;
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

app.get("/cart", async (req, res) => {
  const name = req.session.username;
  const email = req.session.email;
  const userId = req.session.userId;
  const query = `SELECT * FROM cart C
                 JOIN item I
                 ON C.itemId = I.id
                 WHERE C.userId =  ?`;

  const query1 = `SELECT SUM(I.price * C.quantity) AS totalPrice, SUM(quantity) as total
                 FROM cart C
                 JOIN item I
                 ON C.itemId = I.id
                 WHERE C.userId = ?`;
  
  const query2 = `SELECT * FROM item WHERE id < ?`

  if (req.session.username) {
    conn.all(query2, [10], (E, items) => {
      if (E) {
        throw E;        
      } else {
             conn.all(query, [userId], async (err, results) => {
              if (err) {
                throw err;
              } else {
                await conn.all(query1, [userId], (error, carts) => {
                  if (error) {
                    throw error;
                  } else {
                    res.render("cart", {
                      name,
                      results,
                      carts,
                      items,
                      email,
                    });
                    // console.log(results);
                    // console.log(carts);
                  }
                });
              }
            });
      }
    })

  } else {
    res.redirect("/login");
  }

  // const name = "Steve";
});

app.post("/cart-one", async (req, res) => {
  const name = req.session.username;
  const userId = req.session.userId;
  const email = req.session.email;
  const query = `SELECT * FROM cart C
                 JOIN item I
                 ON C.itemId = I.id
                 WHERE C.userId = '${userId}'`;

  // const query1 = `SELECT SUM(quantity) as total FROM cart
  //                 WHERE userId = '${userId}'`;

  // https://1drv.ms/u/s!AhR4a2AQFhH5gho78W5TMfGCxGs9

  const query1 = `SELECT SUM(I.price * C.quantity) AS totalPrice, SUM(quantity) as total
                 FROM cart C
                 JOIN item I
                 ON C.itemId = I.id
                 WHERE C.userId = '${userId}'`;

  

  if (req.session.username) {
    await conn.all(query, async (err, results) => {
      if (err) {
        throw err;
      } else {
        await conn.all(query1, (error, carts) => {
          if (error) {
            throw error;
          } else {
            res.render("cart1", {
              name,
              results,
              carts,
              email,
            });
            // console.log(results);
            // console.log(carts);
          }
        });
      }
    });
  } else {
    res.redirect("/login");
  }

  // const name = "Steve";
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

app.get("/my-orders", (req, res) => {
  if (req.session.username) {
    const userId = req.session.userId;
    const name = req.session.username;
    const email = req.session.email;
    const query = `SELECT * FROM orders O
                 JOIN item I
                 ON O.itemId = I.id
                 WHERE O.userId = '${userId}'`;

    // const query1 = `SELECT SUM(quantity) as total FROM cart
    //               WHERE userId = '${userId}'`;

      const query1 = `SELECT SUM(O.orderId) as TOT, SUM(C.quantity) as total
                 FROM cart C
                 LEFT JOIN orders O
                 ON C.userID = O.userId
                 WHERE (C.userId = ?)`;
    
    const query4 = `SELECT * FROM item`
    conn.all(query1, [userId], (ERR, carts) => {
      if (ERR) {
        throw ERR
      } else {
            conn.all(query4, [], (e, items) => {
              conn.all(query, (err, orders) => {
                if (err) {
                  throw err;
                } else {
                  res.render("order", { orders, name, email, items, carts });
                }
              });
            });
      }        
    })

    
  } else {
    res.redirect("/login");
  }
});

app.get("/add-item", (req, res) => {
  res.render("addItem");
})

app.post("/register", (req, res) => {
  const customer = req.body;
  const user = {
    firstName: customer.fname,
    lastName: customer.lname,
    email: customer.email,
    phone: customer.phone,   
    password: customer.password,
    repPassword: customer.repPassword,    
  };

  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: {
        allow: ["com", "net"],
      },
    }).required(),
    phone: Joi.string().min(10).required(),    
    password: Joi.string().min(4),
    repPassword: Joi.ref("password"), 
  });

  const registeValidation = schema.validate(user);

  if (registeValidation.error) {
    console.log(registeValidation.error.details[0].message);
    const msg = registeValidation.error.details[0].message;
    res.render("signup", {msg});
  } else {
    const query = `INSERT INTO users 
                 (firstName, lastName, email, phone, password)
                 VALUES('${user.firstName}', '${user.lastName}', '${user.email}', '${user.phone}', '${user.password}')`;

    conn.run(query, [], (err) => {
      if (err) {
        throw err;
      } else {
        console.log("Registered!");
        res.redirect("login");
      }
    });
  }

  // console.log(firstName);
});

app.get("/refer:id");
app.get("/search", (req, res) => {
  const name = req.session.username;
  // const name = "Steve";
  res.render("search");
});

app.get("/searcho", (req, res) => {
const fetch = require("node-fetch");

const url = "https://api.flutterwave.com/v3/charges?type=mobile_money_ghana";
const options = {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: "FLWSECK-f3528899bf8914081e94a26e708be794-X",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 10,
    currency: "GHS",
    email: "nyankson25@gamil.com",
    tx_ref: "MC-158523s09v505089",
    phone_number: "0555089255",
    network: "MTN",
    
  }),
};

fetch(url, options)
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => console.error("error:" + err));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});



// https://materialdesignicons.com/
