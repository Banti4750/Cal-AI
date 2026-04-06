const Meal = require('../models/Meal');
const { analyzeFood } = require('../services/geminiService');

exports.createMeal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const { mealType } = req.body;
    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    const { foods, totals } = await analyzeFood(imagePath);

    if (foods.length === 0) {
      return res.status(400).json({ error: 'No food detected in the image. Please try again with a clearer photo.' });
    }

    const today = new Date().toISOString().split('T')[0];

    const meal = await Meal.create({
      user: req.user._id,
      imageUrl,
      mealType: mealType || 'snack',
      foods,
      totals,
      date: today,
    });

    res.status(201).json({ meal });
  } catch (error) {
    console.error('Meal creation error:', error);
    res.status(500).json({ error: 'Failed to analyze food image. Please try again.' });
  }
};

exports.getMeals = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { user: req.user._id };
    if (date) query.date = date;

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    res.json({ meals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    res.json({ meal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
