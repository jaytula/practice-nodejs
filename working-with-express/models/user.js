const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();

    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.equals(product._id);
    });

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex > -1) {
      updatedCartItems[cartProductIndex].quantity += 1;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(item => item.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => {
              return i.productId.equals(p._id);
            }).quantity
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(item => {
      return !item.productId.equals(new mongodb.ObjectId(productId));
    });

    return db.collection('users').updateOne(
      { _id: this._id },
      { $set: { cart: { items: updatedCartItems } } }
    );
  }

  static findById(id) {
    const db = getDb();

    return db.collection('users').findOne({ _id: new mongodb.ObjectId(id) });
  }
}
module.exports = User;
