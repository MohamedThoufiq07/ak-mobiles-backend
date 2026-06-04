const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
