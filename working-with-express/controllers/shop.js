const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(function(products) {
    res.render('shop/product-list', {
      pageTitle: 'All Products',
      path: '/products',
      prods: products
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, function(product) {
    res.render('shop/product-detail', {
      path: '/products',
      pageTitle: product.title,
      product
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(function(products) {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', { path: '/cart', pageTitle: 'Your Cart' });
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { path: '/cart', pageTitle: 'Your Orders' });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { path: '/checkout', pageTitle: 'Checkout' });
};
