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
    case 'checkout.session.completed':
      console.log(dataObject);
      break;
    default:
      // Unexpected event type
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
