const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getSettings);              // public
router.put('/', protect, admin, updateSettings); // admin only

module.exports = router;
