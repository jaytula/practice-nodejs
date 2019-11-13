require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

// const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const PORT = 3001;
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  User.findById('5dc8428408cfb3065e2618da')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => {
    return User.findOne({ email: 'jay@test.com' });
  })
  .then(user => {
    if (!user) {
      const user = new User({
        name: 'Jay',
        email: 'jay@test.com',
        cart: {
          items: []
        }
      });

      return user.save();
    }
    return null;
  })
  .then(result => {
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
  })
  .catch(err => console.log(err));
