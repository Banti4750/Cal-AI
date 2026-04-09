const Meal = require('../models/Meal');
const redisClient = require('../config/redis');

exports.getDailySummary = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const cacheKey = `analytics:daily:${req.user._id}:${date}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const meals = await Meal.find({ user: req.user._id, date });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totals.calories,
        protein: acc.protein + meal.totals.protein,
        carbs: acc.carbs + meal.totals.carbs,
        fat: acc.fat + meal.totals.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const result = {
      date,
      totals,
      goal: req.user.dailyGoal,
      mealsCount: meals.length,
    };
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 180);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWeeklySummary = async (req, res) => {
  try {
    const { weekOf } = req.query;
    const startDate = weekOf ? new Date(weekOf) : getMonday(new Date());
    const cacheKey = `analytics:weekly:${req.user._id}:${startDate.toISOString().split('T')[0]}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }

    const meals = await Meal.find({
      user: req.user._id,
      date: { $in: days },
    });

    const dailyData = days.map((date) => {
      const dayMeals = meals.filter((m) => m.date === date);
      const totals = dayMeals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.totals.calories,
          protein: acc.protein + meal.totals.protein,
          carbs: acc.carbs + meal.totals.carbs,
          fat: acc.fat + meal.totals.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return { date, totals, mealsCount: dayMeals.length };
    });

    const weeklyAvg = {
      calories: Math.round(dailyData.reduce((s, d) => s + d.totals.calories, 0) / 7),
      protein: Math.round(dailyData.reduce((s, d) => s + d.totals.protein, 0) / 7),
      carbs: Math.round(dailyData.reduce((s, d) => s + d.totals.carbs, 0) / 7),
      fat: Math.round(dailyData.reduce((s, d) => s + d.totals.fat, 0) / 7),
    };

    const result = { days: dailyData, average: weeklyAvg, goal: req.user.dailyGoal };
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 180);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const cacheKey = `analytics:monthly:${req.user._id}:${year}-${month}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(`${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    }

    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: days[0], $lte: days[days.length - 1] },
    });

    const dailyData = days.map((date) => {
      const dayMeals = meals.filter((m) => m.date === date);
      const totals = dayMeals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.totals.calories,
          protein: acc.protein + meal.totals.protein,
          carbs: acc.carbs + meal.totals.carbs,
          fat: acc.fat + meal.totals.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return { date, totals, mealsCount: dayMeals.length };
    });

    const activeDays = dailyData.filter((d) => d.mealsCount > 0);
    const monthlyAvg = activeDays.length > 0
      ? {
          calories: Math.round(activeDays.reduce((s, d) => s + d.totals.calories, 0) / activeDays.length),
          protein: Math.round(activeDays.reduce((s, d) => s + d.totals.protein, 0) / activeDays.length),
          carbs: Math.round(activeDays.reduce((s, d) => s + d.totals.carbs, 0) / activeDays.length),
          fat: Math.round(activeDays.reduce((s, d) => s + d.totals.fat, 0) / activeDays.length),
        }
      : { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const result = { days: dailyData, average: monthlyAvg, goal: req.user.dailyGoal };
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 180);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
