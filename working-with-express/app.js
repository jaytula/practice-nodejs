const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


const errorController = require('./controllers/error');
const db = require('./util/database');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

db.execute('SELECT * FROM products')
  .then(result => {
    console.log(result[0], result[1]);
  })
  .catch(err => {
    console.log(err);
  })

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
