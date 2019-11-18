const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.user
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
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
        res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    isAuthenticated: req.session.user
  });
};
exports.postSignup = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }

      return bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] }
        });

        return user.save().then(err => {
          res.redirect('/login');
        });
      });
    })
    .catch(err => console.log(err));
};
