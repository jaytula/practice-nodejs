const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const ITEMS_PER_PAGE = 2;

const appDir = path.dirname(require.main.filename);

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
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

const makeProductListHandler = (templatePath, pageTitle, path) => (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.countDocuments().then(numProducts => {
    totalItems = numProducts;
    return  Product.find().skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
  }).then(products => {
      res.render(templatePath, {
        pageTitle,
        path,
        prods: products,
        currentPage: page,        
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getIndex = makeProductListHandler('shop/index', 'Shop', '/');
exports.getProducts = makeProductListHandler('shop/product-list', 'All Products', '/products');

exports.getCart = (req, res, next) => {
  if (!req.user) res.redirect('/login');
  else
    User.findById(req.user._id)
      .populate('cart.items.productId')
      //.execPopulate()
      .then(result => {
        console.log(result.cart.items);
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: result.cart.items
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
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const order = new Order({
        products: user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        }),
        user: {
          email: req.user.email,
          userId: req.user._id
        }
      });

      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        throw new Error('No order found');
      }
      if (!order.user.userId.equals(req.user._id)) {
        const error = new Error('Unauthorized');
        error.httpStatusCode = 401;
        throw error;
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {underline: true});

      pdfDoc.text('------------------');

      pdfDoc.fontSize(14);

      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price)
      })

      pdfDoc.fontSize(18).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   console.log(err);
      //   if (err) return next(err);

      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
      //   res.send(data);
      // });

      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
  //   fs.access(filePath, fs.F_OK, err => {
  //     if(err) {
  //       console.log(err);
  //       return next(new Error(err));
  //     }

  //     res.download(filePath);
  //   })
};
