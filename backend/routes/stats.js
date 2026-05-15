const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.get('/dashboard', protect, adminOnly, getDashboardStats);

module.exports = router;
