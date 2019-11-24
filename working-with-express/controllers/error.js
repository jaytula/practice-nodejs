exports.get404 = (req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Not Found',
    path: null
  });
};

exports.get500 = (req, res) => {
  res.status(500).render('500', {
    pageTitle: 'Not Found',
    path: null,
    isAuthenticated: req.session.isAuthenticated
  });
};
