const path = require('path');
const fs = require('fs');

const products = [];
const FILEPATH = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);
module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    let products = [];
    fs.readFile(FILEPATH, (err, fileContent) => {
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this);
      fs.writeFile(FILEPATH, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    let products = [];
    fs.readFile(FILEPATH, (err, fileContent) => {
      if (!err) {
        products = JSON.parse(fileContent);
      }
      return cb(products);
    });
  }
};
