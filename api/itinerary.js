export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or restrict to your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // handle preflight
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
