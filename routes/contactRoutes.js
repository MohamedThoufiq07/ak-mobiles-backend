const express = require('express');
const router = express.Router();
const { submitContact, getContactMessages } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, admin, getContactMessages);

module.exports = router;
