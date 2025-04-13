const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const port = 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/api/itinerary', async (req, res) => {
  const { location, startDate, endDate } = req.body;

  // ✨ Build a prompt just in case you want to go live later
  const prompt = `
    You are a travel planner.
    Plan a detailed daily itinerary for a trip to ${location}
    from ${startDate} to ${endDate}. Include 3–5 activities per day with descriptions.
  `;

  // 🧪 MOCK MODE STARTS HERE
  try {
    const fakeItinerary = `
    ✈️ Trip to ${location} from ${startDate} to ${endDate}

    Day 1:
    - Arrive and explore the local neighborhood
    - Visit a famous landmark in ${location}
    - Enjoy dinner at a recommended local restaurant

    Day 2:
    - Take a city tour
    - Visit two museums or cultural spots
    - Try a regional dish for lunch
    - Sunset walk or evening show

    Day 3:
    - Relax at a park or beach
    - Do some shopping or visit a market
    - Farewell dinner with local flair
    `;

    console.log("🧪 Using mock itinerary");
    res.json({ itinerary: fakeItinerary });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend listening at http://localhost:${port}`);
});

