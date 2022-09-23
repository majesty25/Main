const Cart = require("../../database/cart");
const Order = require("../../database/order");
const Items = require("../../database/items");
const Saved = require("../../database/saved");
const Users = require("../../database/users");
const Joi = require("joi");

class Customer {
  constructor(userId) {
    this.userId = userId;
  }

  register(firstName, lastName, email, phone, password, repPassword) {
    const user = {
      firstName,
      lastName,
      email,
      phone,
      password,
      repPassword,
    };

    const userId = this.userId;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: {
            allow: ["com", "net"],
          },
        })
        .required(),
      phone: Joi.string().min(10).required(),
      password: Joi.string().min(4),
      repPassword: Joi.ref("password"),
    });

    const registeValidation = schema.validate(user);

    if (registeValidation.error) {
      console.log(registeValidation.error.details[0].message);
      const msg = registeValidation.error.details[0].message;
      return msg;
    } else {
      Users.insertMany({
        userId,
        firstName,
        lastName,
        email,
        password,
      });
      console.log("Registered!");
      return true;
    }
  }

  async login(password) {
    const email = this.userId;
    const user = {
      email,
      password,
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
      password: Joi.string().pattern(/^[A-zA-Z0-M]{3,30}$/).min(4),
    });
    const loginValidation = schema.validate(user);
    if (loginValidation.error) {
      var errorMessage = loginValidation.error.details[0].message; // req.session.message = errorMessage;
      return errorMessage;
    } else {
      const user = await Users.find({ email, password });
      if (Object.keys(user).length === 0) {
        var errorMessage = "email and password do not match";
        return errorMessage;
      } else {
        return [user, true];
      }
    }
  }

  addItem(
    itemId,
    name,
    description,
    pic,
    otherPics,
    price,
    off,
    category,
    rate,
    stars,
    spec,
    location
  ) {
    console.log(spec);
    Items.insertMany({
      itemId,
      name,
      description,
      pic,
      otherPics,
      price,
      off,
      category,
      rate,
      stars,
      spec,
      location,
    });
  }

  addCart(itemId, quantity, variety) {
    Cart.insertMany({
      itemId,
      quantity: quantity,
      userId: this.userId,
      variety: variety,
    });
  }

  async saveItem(itemId) {
    const save = await Saved.findOne({
      itemId,
      userId: this.userId,
    });
    if (save === null) {
      await Saved.insertMany({
        itemId,
        userId: this.userId,
      });
    } else {
      await Saved.deleteOne({
        itemId,
        userId: this.userId,
      });
    }
  }

  async myCarts() {
    let counter = 0;
    const CART = await Cart.find({
      userId: this.userId,
    });
    for (let i in CART) {
      const x = CART[i];
      const quantity = x.quantity;
      counter = counter + quantity;
    }
    return counter;
  }

  async cart(itemId) {
    return Item.find({
      itemId: itemId,
    });
  }

  deleteCart(Id) {
    Cart.deleteOne({
      itemId: Id,
    });
  }

  increaseItemQuantity(itemId) {
    console.log("hello");
  }

  decreaseItemQuantity(itemId) {
    console.log("hello");
  }

  async placeOrder() {
    const random = Math.random() * 10000000000000;
    const orderId = Math.floor(random);
    const date = new Date();
    const dateFormatted = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric", //or short
      year: "numeric",
    });
    let carts;
    let cart;
    try {
      carts = await Cart.find({ userId: this.userId });
      for (let i in carts) {
        cart = carts[i];
        Order.insertMany({
          orderId,
          itemId: cart.itemId,
          quantity: cart.quantity,
          userId: cart.userId,
          variety: cart.variety,
          date: dateFormatted,
        });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = Customer;
