const express = require('express');
const router = express.Router();
const { createMeal, getMeals, getMeal, deleteMeal } = require('../controllers/mealController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), createMeal);
router.get('/', auth, getMeals);
router.get('/:id', auth, getMeal);
router.delete('/:id', auth, deleteMeal);

module.exports = router;
