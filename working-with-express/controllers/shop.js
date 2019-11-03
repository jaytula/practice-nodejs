const Product = require('../models/product');
// const Order = require('../models/order');
// const OrderItem = require('../models/order-item');
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        prods: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        path: '/products',
        pageTitle: product.title,
        product
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        prods: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  // const cartItems =
  //   req.user.cart && req.user.cart.items ? req.user.cart.items : [];

  // return Promise.all(
  //   cartItems.map(cartItem => {
  //     console.log(cartItem);
  //     return Product.findById(cartItem.productId).then(product => {
  //       return { ...cartItem, title: product.title }
  //     })
  //   })
  // )

  req.user.getCart()
  .then(cartItems => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: cartItems
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user.createOrder().then(order => {
        return order.addProducts(
          products.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity };
            return product;
          })
        );
      });
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ['products'] })
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { path: '/checkout', pageTitle: 'Checkout' });
};
