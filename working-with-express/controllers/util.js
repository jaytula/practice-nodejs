const User = require('../models/user');
const Order = require('../models/order');

exports.postWebhook = (req, res) => {
  let event;

  try {
    event = JSON.parse(req.body);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`webhook event: ${event.type}`);
  const dataObject = event.data.object;
  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_method.attached':
    case 'payment_intent.created':
    case 'charge.succeeded':
      break;
    case 'checkout.session.completed':
      let savedUser;
      return User.findById(dataObject.client_reference_id)
        .populate('cart.items.productId')
        .then(user => {
          savedUser = user;
          console.log({savedUser});
          const order = new Order({
            products: user.cart.items.map(i => {
              return { quantity: i.quantity, product: { ...i.productId._doc } };
            }),
            user: {
              email: user.email,
              userId: user._id
            }
          });

          return order.save();
        })
        .then(result => {
          return savedUser.clearCart();
        })
        .then(result => {
          return res.json({ received: true });
        });
      break;
    default:
      // Unexpected event type
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
