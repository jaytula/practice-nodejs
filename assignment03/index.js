const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'users.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
