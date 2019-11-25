const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post(
  '/add-product',
  isAuth,
  [
    body('title')
      .isLength({ min: 3 })
      .isString()
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5 })
      .trim()
  ],
  adminController.postAddProduct
);
router.post(
  '/edit-product',
  isAuth,
  [
    body('title')
      .isLength({ min: 3 })
      .isString()
      .trim(),
    body('price').isFloat(),
    body('imageUrl').isURL(),
    body('description')
      .isLength({ min: 5 })
      .trim()
  ],
  adminController.postEditProduct
);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
