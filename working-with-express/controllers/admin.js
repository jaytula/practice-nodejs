const mongoose = require('mongoose');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect('/');
  }
  Product.findById(req.params.productId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const product = new Product({title, price, imageUrl, description});
  product
    .save().then(
      err => {
      if(err) return console.log(err);
      res.redirect('/admin/products');
    })
};

exports.postEditProduct = (req, res, next) => {
  prodId = req.body.productId;
  updatedTitle = req.body.title;
  updatedPrice = req.body.price;
  updatedImageUrl = req.body.imageUrl;
  updatedDesc = req.body.description;
  
  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;

      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  //Product.deleteOne({_id: new mongoose.Types.ObjectId(productId)})
  Product.findByIdAndDelete(productId)
    .then(result => {
      console.log('DESTROYED PRODUCT');
      return result;
      // Cart.deleteProduct(productId, () => {
      //   res.redirect('/admin/products');
      // });
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err => console.log(err));
};
