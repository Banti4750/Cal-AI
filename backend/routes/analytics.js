const express = require('express');
const router = express.Router();
const { getDailySummary, getWeeklySummary, getMonthlySummary } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/daily', auth, getDailySummary);
router.get('/weekly', auth, getWeeklySummary);
router.get('/monthly', auth, getMonthlySummary);

module.exports = router;
