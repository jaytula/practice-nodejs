exports.postWebhook = (req, res) => {
  let event;

  try {
    event = JSON.parse(req.body);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log({paymentIntent});
      console.log('PaymentIntent was successful');
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log({paymentMethod});
      console.log('PaymentMethod was attached to a Customer!');
      break;
    case 'payment_intent.created':
      console.log('PaymentIntent created');
      break;
    case 'charge.succeeded':
      console.log('Charge succeeded');
      break;
    default:
      // Unexpected event type
      console.log(event.type);
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
