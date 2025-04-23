export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://planamvp-bz1hktnn1-orionus-projects.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel planner assistant.',
          },
          {
            role: 'user',
            content: `Create a day-by-day itinerary for a trip to ${req.body.location} from ${req.body.startDate} to ${req.body.endDate}. Notes: ${req.body.userInput || 'none'}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({ error: 'Invalid response from OpenAI' });
    }

    res.status(200).json({ itinerary: data.choices[0].message.content });
  } catch (error) {
    console.error('X OpenAI error:', error.message);
    res.status(500).json({ error: 'Failed to generate itinerary.' });
  }
}
