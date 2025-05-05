export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
  
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: req.body.messages,
        }),
      });
  
      const data = await response.json();
  
      if (!data.choices || !data.choices.length) {
        return res.status(500).json({ error: 'Invalid response from OpenAI' });
      }
  
      res.status(200).json({ reply: data.choices[0].message.content });
    } catch (error) {
      console.error('Chat API error:', error.message);
      res.status(500).json({ error: 'Failed to generate chat response.' });
    }
  }
  