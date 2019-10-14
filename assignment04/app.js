const PORT = process.env.PORT || 3000;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(routes);

app.use((req, res) => {
  res.render('404', { pageTitle: '404 Page Not Found' });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
