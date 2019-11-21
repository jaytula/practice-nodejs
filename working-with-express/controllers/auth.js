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

exports.getLogin = (req, res) => {
  let message = req.flash('error');
  message = message.length ? message[0] : null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
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
  let user;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password).then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid Password');
        res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
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
      .catch(err => console.log(err));
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
    errorMessage: message
  });
};
exports.postSignup = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      isAuthenticated: req.session.user,
      errorMessage: errors.array()
    });

  }

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'Email already signed up');
        return res.redirect('/signup');
      }

      return bcrypt.hash(password, 12).then(hashedPassword => {
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
    })
    .catch(err => console.log(err));
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
    .catch(err => console.log(err));
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
        return {user, hashedPassword};
      })
    }).then(({user, hashedPassword}) => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => console.log(err));
};
