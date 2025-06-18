export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Restrict to POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { location, startDate, endDate, userInput } = req.body;

    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: location, startDate, or endDate' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a professional travel planner. ONLY respond with a clearly structured Markdown itinerary in this format:

**Day 1**
- **Morning:** ...
- **Afternoon:** ...
- **Evening:** ...

**Day 2**
- **Morning:** ...
- **Afternoon:** ...
- **Evening:** ...

- Include links to restaurants, landmarks, and experiences where possible using proper [Markdown](https://example.com) format.
- Do NOT include greetings, summaries, or phrases like “Let me know if you want changes.” 
- DO NOT wrap the whole thing in triple backticks. Just return markdown directly.`,
          },
          {
            role: 'user',
            content: `Create a detailed day-by-day itinerary for a trip to ${location} from ${startDate} to ${endDate}.${userInput ? ' Notes: ' + userInput : ''}`,
          },
        ],
      }),
    });

    const data = await openaiRes.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', data);
      return res.status(500).json({ error: 'Invalid response from OpenAI' });
    }

    const raw = data.choices[0].message.content;

    const cleaned = raw
      .replace(/^.*?(?:\*\*Day\s*1\*\*|Day\s*1)/is, '$1') // remove preamble before Day 1
      .replace(/(Let me know.*|Safe travels.*|Enjoy your trip.*|Please let me know.*)/gi, '') // strip fluff
      .trim();

    return res.status(200).json({ itinerary: cleaned });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate itinerary.' });
  }
}
