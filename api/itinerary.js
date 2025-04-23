// /api/itinerary.js

import { OpenAI } from 'openai';

// api/itinerary.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { location, startDate, endDate, userInput } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured.' });
  }

  if (!location || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const prompt = `
You are a travel planner. Generate a detailed 3-day itinerary for a trip to ${location}
from ${startDate} to ${endDate}.
Include morning, afternoon, and evening activities.
User preferences: ${userInput || 'None'}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful travel assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({ error: 'Invalid response from OpenAI' });
    }

    res.status(200).json({ itinerary: data.choices[0].message.content });
  } catch (error) {
    console.error('❌ OpenAI error:', error.message);
    res.status(500).json({ error: 'Failed to generate itinerary.' });
  }
}

