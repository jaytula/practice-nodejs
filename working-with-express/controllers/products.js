const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    activeAddProduct: true,
    productCSS: true,
    formsCSS: true
  });
};

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(function(products) {
    res.render('shop/product-list', {
      pageTitle: 'Shop',
      path: '/',
      prods: products,
      hasProducts: !!products.length,
      activeShop: true,
      productCSS: true
    });
  });
};
