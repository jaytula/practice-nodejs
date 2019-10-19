const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart

    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(
        prod => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      console.log({ existingProductIndex, existingProduct });
      // Add new product / increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.price = +productPrice;
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, price: productPrice, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;

      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, cb) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const updatedProducts = cart.products.filter(
        product => product.id !== id
      );
      const updatedTotalPrice = updatedProducts.reduce(
        (acc, curr) => acc + curr.qty * curr.price,
        0
      );
      const updatedCart = {
        products: updatedProducts,
        totalPrice: updatedTotalPrice
      };
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        if (err) console.log(err);
        cb();
      });
    });
  }

  static getCart(cb) {
     fs.readFile(p, (err, fileContent) => {
       let cart = { products: [], totalPrice: 0 };
       if(!err) {
         cart = JSON.parse(fileContent);
       }
       cb(cart);
     })
  }
};
