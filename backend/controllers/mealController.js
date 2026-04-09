const Meal = require('../models/Meal');
const { analyzeFood } = require('../services/geminiService');
const redisClient = require('../config/redis');

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

    const keys = await redisClient.keys(`meals:${req.user._id}*`);
    if (keys.length) await redisClient.del(...keys);
    res.status(201).json({ meal });
  } catch (error) {
    console.error('Meal creation error:', error);
    res.status(500).json({ error: 'Failed to analyze food image. Please try again.' });
  }
};

exports.getMeals = async (req, res) => {
  try {
    const { date } = req.query;
    const cacheKey = `meals:${req.user._id}${date ? `:${date}` : ''}`;

    const cached = await redisClient.get(cacheKey);
    // console.log('Cache key:', cacheKey, 'Cached data:', cached);
    if (cached) {
      return res.json({ meals: JSON.parse(cached) });
    }

    const query = { user: req.user._id };
    if (date) query.date = date;

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    await redisClient.set(cacheKey, JSON.stringify(meals), 'EX', 180);
    res.json({ meals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMeal = async (req, res) => {
  try {
    if(!req.params.id) {
      return res.status(400).json({ error: 'Meal ID is required' });
    }
    const cachedMeal = await redisClient.get(`meal:${req.params.id}`);
    if (cachedMeal) {
      return res.json({ meal: JSON.parse(cachedMeal) });
    }

    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });

    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    await redisClient.set(`meal:${req.params.id}`, JSON.stringify(meal), 'EX', 180);
    res.json({ meal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    await redisClient.del(`meal:${req.params.id}`);
    const keys = await redisClient.keys(`meals:${req.user._id}*`);
    if (keys.length) await redisClient.del(...keys);
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
