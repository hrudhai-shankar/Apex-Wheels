const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/user.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// All routes here are admin-only
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

module.exports = router;
