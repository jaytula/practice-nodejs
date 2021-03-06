const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const options = {
  auth: {
    api_key: process.env.SENDGRID_KEY
  }
};

const transporter = nodemailer.createTransport(sendgridTransport(options));

const renderLogin = (res, status = 200, localsOverride = {}) => {
  const errorMessage =
    localsOverride.validationErrors && localsOverride.validationErrors.length
      ? localsOverride.validationErrors[0].msg
      : '';
  const locals = Object.assign(
    {
      path: '/login',
      pageTitle: 'Login',
      oldInput: { email: '', password: '' },
      errorMessage,
      validationErrors: []
    },
    localsOverride
  );

  return res.status(status).render('auth/login', locals);
};

exports.getLogin = (req, res) => {
  return renderLogin(res, 200);
};

exports.getReset = (req, res) => {
  let message = req.flash('error');
  message = message.length ? message[0] : null;
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Password Reset',
    errorMessage: message
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  const validationErrors = errors.array();

  if (!errors.isEmpty()) {
    return renderLogin(res, 422, {
      oldInput: { email: email, password: password },
      validationErrors
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return renderLogin(res, 422, {
          oldInput: { email: email, password: password },
          validationErrors: [{ param: 'email', msg: 'Invalid Email' }]
        });
      }
      bcrypt.compare(password, user.password).then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            res.redirect('/');
          });
        }
        return renderLogin(res, 422, {
          oldInput: { email: email, password: password },
          validationErrors: [{ param: 'email', msg: 'Invalid Password' }]
        });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postReset = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Invalid email');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;
        return user.save().then(result => {
          res.redirect('/');
          transporter.sendMail({
            to: req.body.email,
            from: 'test@example.com',
            subject: 'Password Reset',
            html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3001/reset/${token}">link</a> to set a new password</p>
            `
          });
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
      });
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  message = message.length ? message[0] : null;

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    isAuthenticated: req.session.user,
    errorMessage: message,
    oldInput: { email: '', password: '', confirmPassword: '' },
    validationErrors: []
  });
};
exports.postSignup = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  const validationErrors = errors.array();
  console.log(validationErrors);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      isAuthenticated: req.session.user,
      errorMessage: validationErrors[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors
    });
  }

  bcrypt.hash(password, 12).then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] }
    });

    return user.save().then(err => {
      const emailObject = {
        to: [email],
        from: 'test@example.com',
        subject: 'Signup succeeded!',
        text: 'Awesome sauce',
        html: '<b>Awesome pickle</b>'
      };

      transporter.sendMail(emailObject, (err, res) => {
        if (err) console.log(err);
        console.log(res);
      });
      res.redirect('/login');
    });
  });
};

exports.getNewPassword = (req, res) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      message = message.length ? message[0] : null;

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postNewPassword = (req, res) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  User.findOne({
    resetToken: passwordToken,
    _id: userId,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      return bcrypt.hash(newPassword, 12).then(hashedPassword => {
        return { user, hashedPassword };
      });
    })
    .then(({ user, hashedPassword }) => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
