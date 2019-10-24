const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

CartItem.belongsTo(Cart, { constraints: true, onDelete: 'CASCASE' });
Cart.hasMany(CartItem);

sequelize
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({
        name: 'dummy',
        email: 'dummy@example.com'
      });
    }
    return user;
  })
  .then(user => {
    return user.createCart().catch(err => console.log(err));
  })
  .then(() => {
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
