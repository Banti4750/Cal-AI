const express = require('express');
const router = express.Router();
const { signup, signin, getProfile, updateGoals } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', auth, getProfile);
router.put('/goals', auth, updateGoals);

module.exports = router;
