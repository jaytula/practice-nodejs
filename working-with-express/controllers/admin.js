const mongoose = require('mongoose');
const Product = require('../models/product');
const { validationResult } = require('express-validator');

const renderEditProduct = (res, status = 200, localsOverride = {}) => {
  const errorMessage =
    localsOverride.validationErrors && localsOverride.validationErrors.length
      ? localsOverride.validationErrors[0].msg
      : '';
  const locals = Object.assign(
    {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: { title: '', imageUrl: '', price: '', description: '' },
      errorMessage,
      validationErrors: [],
      hasError: false
    },
    localsOverride
  );

  res.status(status).render('admin/edit-product', locals);
};

exports.getAddProduct = (req, res, next) => {
  renderEditProduct(res);
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
        product: product,
        isAuthenticated: req.user,
        hasError: false
      });
    })
    .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const errors = validationResult(req);
  const validationErrors = errors.array();
  if (!errors.isEmpty()) {
    return renderEditProduct(res, 422, {
      product: { title, imageUrl, price, description },
      validationErrors,
      hasError: true
    });
  }

  const product = new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.user
  });
  product.save().then(result => {
    res.redirect('/admin/products');
  });
};

exports.postEditProduct = (req, res, next) => {
  prodId = req.body.productId;
  updatedTitle = req.body.title;
  updatedPrice = req.body.price;
  updatedImageUrl = req.body.imageUrl;
  updatedDesc = req.body.description;

  const errors = validationResult(req);
  const validationErrors = errors.array();

  Product.findById(prodId)
    .then(product => {
      if (!product.userId.equals(req.user._id)) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;

      return product.save().then(() => {
        res.redirect('/admin/products');
      });
    })

    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  //Product.deleteOne({_id: new mongoose.Types.ObjectId(productId)})
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(result => {
      console.log('product destroyed');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  //Product.find({ userId: req.user._id })
  Product.find()
    //.select('title price -_id')
    //.populate('userId')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};
