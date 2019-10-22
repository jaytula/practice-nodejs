const Product = require('../models/product');
const Cart = require('../models/cart');

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
  Product.findById(req.params.productId, product => {
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  Product.create({title, imageUrl, description, price})
    .then(() => {
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;

  const updatedProduct = new Product(
    productId,
    title,
    imageUrl,
    description,
    price
  );

  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.deleteById(productId, () => {
    Cart.deleteProduct(productId, () => {
      res.redirect('/admin/products');
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(function(products) {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};
