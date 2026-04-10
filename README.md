# Cal AI - AI-Powered Calorie Tracker

Visit -> [https://calai.edgeone.app/](https://calai.edgeone.app/)

A mobile calorie tracking app that uses AI to analyze food photos and automatically estimate calories and macronutrients. Built with React Native (Expo) and Node.js/Express.

## Features

- **AI Food Recognition** - Take a photo of your meal and get instant calorie/macro estimates powered by Google Gemini
- **Daily Dashboard** - Circular calorie ring and macro progress cards (protein, carbs, fat)
- **Meal History** - View all logged meals with food item breakdowns
- **Analytics** - Weekly bar charts and monthly trend lines for calories and macros
- **Custom Goals** - Set personalized daily targets for calories, protein, carbs, and fat
- **Auth** - Secure signup/signin with JWT

## Tech Stack

| Layer       | Technology              |
| ----------- | ----------------------- |
| Mobile App  | React Native (Expo)     |
| Backend API | Node.js, Express        |
| Database    | MongoDB (Mongoose)      |
| AI Model    | Google Gemini 2.5 Flash |
| Auth        | JWT + bcrypt            |

## Project Structure

```
cal AI/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers (auth, meals, analytics)
│   ├── middleware/       # JWT auth, multer image upload
│   ├── models/          # Mongoose schemas (User, Meal)
│   ├── routes/          # Express route definitions
│   ├── services/        # Gemini AI integration
│   ├── uploads/         # Uploaded meal images
│   └── server.js        # Entry point
│
├── frontend/
│   └── src/
│       ├── components/  # CalorieRing, MacroCard, MealCard
│       ├── context/     # AuthContext (global auth state)
│       ├── navigation/  # Stack + Tab navigators
│       ├── screens/     # Auth, Home, Camera, Analytics, Profile
│       ├── services/    # Axios API client
│       └── theme/       # Dark theme colors and spacing
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key ([Get one free](https://aistudio.google.com/apikey))
- Expo Go app on your phone

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/calai
JWT_SECRET=your_secret_here
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
```

Update the API URL in `src/services/api.js` with your machine's local IP:

```js
const API_BASE_URL = "https://cal-ai-4d0f.onrender.com/api";
```

Start Expo:

```bash
npx expo start
```

Scan the QR code with Expo Go.

### 3. Firewall (Windows)

If your phone can't reach the backend, open port 5000 in an **admin terminal**:

```
netsh advfirewall firewall add rule name="CalAI Backend" dir=in action=allow protocol=TCP localport=5000
```

## API Endpoints

### Auth

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | `/api/auth/signup`  | Create account     |
| POST   | `/api/auth/signin`  | Login              |
| GET    | `/api/auth/profile` | Get user profile   |
| PUT    | `/api/auth/goals`   | Update daily goals |

### Meals

| Method | Endpoint                     | Description                             |
| ------ | ---------------------------- | --------------------------------------- |
| POST   | `/api/meals`                 | Upload meal photo (multipart/form-data) |
| GET    | `/api/meals?date=YYYY-MM-DD` | Get meals by date                       |
| GET    | `/api/meals/:id`             | Get single meal                         |
| DELETE | `/api/meals/:id`             | Delete meal                             |

### Analytics

| Method | Endpoint                              | Description       |
| ------ | ------------------------------------- | ----------------- |
| GET    | `/api/analytics/daily?date=`          | Daily summary     |
| GET    | `/api/analytics/weekly?weekOf=`       | Weekly breakdown  |
| GET    | `/api/analytics/monthly?month=&year=` | Monthly breakdown |

## How It Works

1. User takes a photo of their meal
2. Image is uploaded to the backend
3. Backend sends the image to Google Gemini with a structured prompt
4. Gemini identifies each food item and estimates calories, protein, carbs, and fat
5. Results are saved to MongoDB and displayed to the user
6. Dashboard and analytics update automatically
