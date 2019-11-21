const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin)
router.get('/reset', authController.getReset)
router.post('/login', authController.postLogin)
router.post('/reset', authController.postReset)
router.get('/signup', authController.getSignup)
router.post('/signup', check('email').isEmail(),  authController.postSignup)
router.post('/logout', authController.postLogout)

router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)
module.exports = router;