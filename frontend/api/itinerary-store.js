import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    const { tripId } = req.query;
    if (!tripId) {
      return res.status(400).json({ error: 'Missing tripId in query.' });
    }

    try {
      const itinerary = await kv.get(`itinerary_${tripId}`);
      const chatHistory = await kv.get(`chat_${tripId}`);

      return res.status(200).json({
        itinerary: itinerary || '',
        chatHistory: chatHistory || [],
      });
    } catch (err) {
      console.error('Error fetching from KV:', err);
      return res.status(500).json({ error: 'Failed to load data from storage.' });
    }
  }

  if (method === 'POST') {
    const { tripId, itinerary, chatHistory } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: 'Missing tripId in request body.' });
    }

    try {
      if (itinerary) await kv.set(`itinerary_${tripId}`, itinerary);
      if (chatHistory) await kv.set(`chat_${tripId}`, chatHistory);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error saving to KV:', err);
      return res.status(500).json({ error: 'Failed to save to storage.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
