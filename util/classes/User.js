const Cart = require("../../database/cart");
const Items = require("../../database/items");
const Saved = require("../../database/saved");

class Customer {
  constructor(userId) {
    this.userId = userId;
  }

  addItem(
    itemId,
    name,
    description,
    pic,
    price,
    off,
    category,
    rate,
    stars,
    location
  ) {
    Items.insertMany({
      itemId,
      name,
      description,
      pic,
      price,
      off,
      category,
      rate,
      stars,
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
    const save = await Saved.findOne({ itemId, userId: this.userId });
    if (save === null) {
      await Saved.insertMany({
        itemId,
        userId: this.userId,
      });
    } else {
      await Saved.deleteOne({ itemId, userId: this.userId });
    }
  }

  async myCarts() {
    let counter = 0;
    const CART = await Cart.find({ userId: this.userId });
    for (let i in CART) {
      const x = CART[i];
      const quantity = x.quantity;
      counter = counter + quantity;
    }
    return counter;
  }

  async cart(itemId) {
    return Item.find({ itemId: itemId });
  }

  deleteCart(Id) {
    Cart.deleteOne({ itemId: Id });
  }

  increaseItemQuantity(itemId) {
    console.log("hello");
  }

  decreaseItemQuantity(itemId) {
    console.log("hello");
  }

  placeOrder() {}
}

module.exports = Customer;
