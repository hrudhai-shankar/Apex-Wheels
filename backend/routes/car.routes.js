const express = require('express');
const router = express.Router();
const { getCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/car.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/', getCars);
router.get('/:id', getCarById);

// Admin-only routes
router.post('/', verifyToken, verifyAdmin, createCar);
router.put('/:id', verifyToken, verifyAdmin, updateCar);
router.delete('/:id', verifyToken, verifyAdmin, deleteCar);

module.exports = router;
