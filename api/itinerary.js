import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { location, startDate, endDate, userInput } = req.body;

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
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful travel assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    res.status(200).json({
      itinerary: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Failed to generate itinerary.' });
  }
}
