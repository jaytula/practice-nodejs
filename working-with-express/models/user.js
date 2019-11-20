const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: {type:String, required: true },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          quantity: { type: Number, required: true }
        }
      ]
    }
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.equals(product._id);
  });

  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex > -1) {
    updatedCartItems[cartProductIndex].quantity += 1;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: 1
    });
  }

  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  console.log({productId})
     const updatedCartItems = this.cart.items.filter(item => {
      return !item.productId.equals(new mongoose.Types.ObjectId(productId));
    });

    this.cart = { items: updatedCartItems };
    return this.save();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: this._id },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
}

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
}

module.exports = mongoose.model('User', userSchema);
