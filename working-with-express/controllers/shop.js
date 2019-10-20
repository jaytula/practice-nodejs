const Product = require('../models/product');
const Cart = require('../models/cart');

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
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = cart.products.map(cartProduct => {
        const product = products.find(prod => prod.id === cartProduct.id);
        return { productData: product, qty: cartProduct.qty };
      });
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });

  res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Cart.deleteProduct(prodId, () => {
    res.redirect('/cart');
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { path: '/orders', pageTitle: 'Your Orders' });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { path: '/checkout', pageTitle: 'Checkout' });
};
