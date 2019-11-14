exports.getLogin = (req, res) => {
//   const isLoggedIn =req.get('Cookie').split(';')[1].trim().split('=')[1] === 'true'
//   console.log({isLoggedIn})
  console.log({isLoggedIn: req.session.isLoggedIn});
  const isLoggedIn = false;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn
  });
};

exports.postLogin = (req, res) => {
  req.session.isLoggedIn = true;
  res.redirect('/');
};
