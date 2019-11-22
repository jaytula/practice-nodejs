const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail(),
    body('password')
      .isLength({ min: 5 })
      .trim()
  ],
  authController.getLogin
);
router.get('/reset', authController.getReset);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password', 'Password has to be valid')
      .isLength({ min: 5 })
      .isAlphanumeric()
  ],
  authController.postLogin
);
router.post('/reset', authController.postReset);
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one'
            );
          }
        })
      }).normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters'
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match');
      }
      return true;
    })
  ],
  authController.postSignup
);
router.post('/logout', authController.postLogout);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;
