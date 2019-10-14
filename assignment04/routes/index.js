const express = require('express');

const router = express.Router();

const USERS = [];

router.get('/users', (req, res) => {
  res.render('users', { pageTitle: 'User Listing', users: USERS, path: '/users' });
});

router.get('/', (req, res) => {
  res.render('add-user', { pageTitle: 'Add a User', path: '/' });
});

router.post('/', (req, res) => {
  const name = req.body.name;
  if(name) USERS.push({ name });

  res.redirect('/users');
});
module.exports = router;
