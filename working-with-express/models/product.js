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
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(FILEPATH, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static update(product) {
    getProductsFromFile(products => {
      const productIndex = products.findIndex(prod => prod.id === product.id);
      const updatedProducts = [...products];
      updatedProducts[productIndex] = {...product};
      fs.writeFile(FILEPATH, JSON.stringify(products), err => {
        console.log(err);
      });
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id===id);
      cb(product);
    })
  }
};
