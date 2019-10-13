const path = require('path');
const express = require('express');

const rootDir = path.dirname(process.mainModule.filename);

const router = express.Router();

router.use('/users', (req, res) => {
  res.sendFile(path.join(rootDir, 'views', 'users.html'));
});

router.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'views', 'home.html'));
});

module.exports = router;
