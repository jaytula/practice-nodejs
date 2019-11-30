const express = require('express');

const utilController = require('../controllers/util');

const router = express.Router();

router.post('/webhook', utilController.postWebhook)

module.exports = router;