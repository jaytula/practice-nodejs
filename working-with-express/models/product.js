const path = require('path');
const fs = require('fs');

const FILEPATH = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  let products = [];
  fs.readFile(FILEPATH, (err, fileContent) => {
    if (!err) {
      products = JSON.parse(fileContent);
    }
    return cb(products);
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      let updatedProducts = [...products];
      if (this.id) {
        const existingProductIndex = products.findIndex(
          prod => prod.id === this.id
        );
        updatedProducts[existingProductIndex] = this;
      } else {
        this.id = Math.random().toString();
        console.log({updatedProducts});
        updatedProducts.push(this);
      }
      fs.writeFile(FILEPATH, JSON.stringify(updatedProducts), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    });
  }
};
