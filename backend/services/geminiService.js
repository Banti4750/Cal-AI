const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT = `Analyze this food image carefully. Identify every food item visible in the image.
For each item, estimate the portion size and provide nutritional information per serving.

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "foods": [
    {
      "name": "food item name",
      "quantity": "estimated weight or portion (e.g. 150g, 1 cup, 2 pieces)",
      "calories": number,
      "protein": number in grams,
      "carbs": number in grams,
      "fat": number in grams
    }
  ]
}

Rules:
- Be as accurate as possible with calorie and macro estimates
- List each distinct food item separately
- If you see a drink, include it
- If you cannot identify any food, return: { "foods": [] }
- Return ONLY the JSON object, nothing else`;

async function analyzeFood(imagePath) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  const ext = imagePath.split('.').pop().toLowerCase();
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const mimeType = mimeMap[ext] || 'image/jpeg';

  const result = await model.generateContent([
    PROMPT,
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
  ]);

  const response = result.response;
  let text = response.text();

  // Strip markdown code fences if present
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  const parsed = JSON.parse(text);

  // Calculate totals
  const totals = parsed.foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { foods: parsed.foods, totals };
}

module.exports = { analyzeFood };
