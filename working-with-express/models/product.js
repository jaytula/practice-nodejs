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
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(FILEPATH, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
