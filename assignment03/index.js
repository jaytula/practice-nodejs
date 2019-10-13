const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3000;

const routes = require('./routes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
