const mongoose = require('mongoose');
const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

const renderEditProduct = (res, status = 200, localsOverride = {}) => {
  const errorMessage =
    localsOverride.validationErrors && localsOverride.validationErrors.length
      ? localsOverride.validationErrors[0].msg
      : '';
  const editing = !!localsOverride.editing;
  const locals = Object.assign(
    {
      pageTitle: editing ? 'Edit Product' : 'Add Product',
      path: editing ? '/admin/edit-product' : '/admin/add-product',
      editing,
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
      renderEditProduct(res, 200, { editing: true, product });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;

  if (!image) {
    return renderEditProduct(res, 422, {
      validationErrors: [
        { param: 'image', msg: 'Attached File is not an image' }
      ],
      product: {
        title,
        price,
        description
      },
      hasError: true
    });
  }

  const imageUrl = image.path;

  const errors = validationResult(req);
  const validationErrors = errors.array();
  if (!errors.isEmpty()) {
    return renderEditProduct(res, 422, {
      product: { title, price, description },
      validationErrors,
      hasError: true
    });
  }

  const product = new Product({
    //_id: new mongoose.Types.ObjectId('5dd8461de64a3b1d7d3c8182'),
    title,
    price,
    imageUrl,
    description,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  const validationErrors = errors.array();

  if (!errors.isEmpty()) {
    const product = {
      _id: prodId,
      title: updatedTitle,
      price: updatedPrice,
      description: updatedDesc
    };

    return renderEditProduct(res, 422, {
      editing: true,
      product: product,
      hasError: true,
      validationErrors
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (!product.userId.equals(req.user._id)) {
        console.log('Wrong User');
        console.log(product);
        console.log(req.user);
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = req.file.path;
      }

      return product.save().then(() => {
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const { productId } = req.params;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: productId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({message: 'Success!'})
    })
    .catch(err => {
      res.status(500).json({message: 'Deleting product failed.'})
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    //Product.find()
    //.select('title price -_id')
    //.populate('userId')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
