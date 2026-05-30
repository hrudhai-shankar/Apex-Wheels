const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, createUpgradeOrder, verifyUpgrade } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getProfile);
router.post('/upgrade-order', verifyToken, createUpgradeOrder);
router.post('/upgrade-verify', verifyToken, verifyUpgrade);

module.exports = router;
