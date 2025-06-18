import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ChatInterface from '../../components/ChatInterface';

function Itinerary({ location, setLocation, selectedTripId, setSelectedTripId }) {
  const [savedTrips, setSavedTrips] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [reloadToggle, setReloadToggle] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('planA_trips')) || [];
    setSavedTrips(stored);

    if (stored.length > 0 && !selectedTripId) {
      setSelectedTripId(stored[0].id);
      setLocation(stored[0].location);
    }
  }, [setLocation, selectedTripId, setSelectedTripId]);

  useEffect(() => {
    const trip = savedTrips.find((t) => t.id === selectedTripId);
    if (!trip) return;

    setLocation(trip.location);
    setItinerary('');
    setChatMessages([]);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/itinerary-store?tripId=${trip.id}`);
        const data = await res.json();
        if (res.ok) {
          setItinerary(data.itinerary || '');
          setChatMessages(data.chatHistory || []);
        } else {
          console.warn('⚠️ Failed to load itinerary:', data.error);
        }
      } catch (err) {
        console.error('❌ Error loading itinerary:', err);
      }
    };

    fetchData();
  }, [selectedTripId, savedTrips, reloadToggle]);

  useEffect(() => {
    const handleFocus = () => setReloadToggle(prev => !prev);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const generateItinerary = async (trip) => {
    if (!trip) return;

    setLoading(true);
    setItinerary('');

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: trip.location,
          startDate: trip.startDate,
          endDate: trip.endDate,
          userInput: userInput || '',
        }),
      });

      if (!response.ok) throw new Error(`Server returned status ${response.status}`);

      const data = await response.json();
      const generated = data.itinerary || '⚠️ No itinerary found in response.';
      setItinerary(generated);

      await fetch('/api/itinerary-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          itinerary: generated,
          chatHistory: [],
        }),
      });
    } catch (err) {
      console.error(err);
      setItinerary(`⚠️ Error connecting to the itinerary API. Here's a sample itinerary:

Day 1: Explore the city center and visit local museums.  
Day 2: Take a guided tour or day trip to nearby attractions.  
Day 3: Enjoy local food, shopping, and scenic areas.`);
    }

    setLoading(false);
  };

  return (
    <div style={outerContainer}>
      <div style={innerBox}>
        <h2 style={heading}>Your Itinerary</h2>

        <label style={labelStyle}>Select Trip:</label>
        <select
          value={selectedTripId}
          onChange={(e) => {
            const tripId = e.target.value;
            setSelectedTripId(tripId);
            const trip = savedTrips.find((t) => t.id === tripId);
            if (trip) setLocation(trip.location);
          }}
          style={inputStyle}
        >
          <option value="">-- Select a trip --</option>
          {savedTrips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.location} ({trip.startDate} → {trip.endDate})
            </option>
          ))}
        </select>

        <label style={labelStyle}>Custom Notes:</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g. Include relaxing beach activities or focus on cultural sites"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <button
          onClick={() => generateItinerary(savedTrips.find((t) => t.id === selectedTripId))}
          disabled={loading || !selectedTripId}
          style={buttonStyle}
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>

        {itinerary && (
          <div style={markdownContainer}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    style={{ color: '#4ea1ff', textDecoration: 'underline' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                p: ({ node, ...props }) => <p style={{ marginBottom: '0.8rem' }} {...props} />,
                li: ({ node, ...props }) => <li style={{ marginBottom: '0.3rem' }} {...props} />,
              }}
            >
              {itinerary}
            </ReactMarkdown>
          </div>
        )}

        {itinerary && (
          <ChatInterface
            key={selectedTripId}
            location={location}
            selectedTripId={selectedTripId}
            initialItinerary={itinerary}
            initialMessages={chatMessages}
            onUpdateItinerary={(newItinerary) => setItinerary(newItinerary)}
          />
        )}
      </div>
    </div>
  );
}

// ---------- STYLES ----------
const outerContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  minHeight: '100vh',
  width: '100vw',
  padding: '2rem 1rem',
  backgroundColor: '#121212',
  boxSizing: 'border-box',
};

const innerBox = {
  width: '100%',
  maxWidth: '520px',
  background: '#1e1e1e',
  padding: '1.8rem',
  borderRadius: '12px',
  boxShadow: '0 0 10px rgba(0,0,0,0.4)',
  color: 'white',
  margin: '0 auto',
  boxSizing: 'border-box',
};

const heading = {
  marginBottom: '1.5rem',
  fontSize: '1.4rem',
};

const labelStyle = {
  display: 'block',
  color: 'white',
  fontSize: '0.9rem',
  marginBottom: '0.4rem',
  marginTop: '1rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: '6px',
  border: '1px solid #444',
  background: '#2b2b2b',
  color: 'white',
  marginBottom: '1rem',
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '6px',
  border: 'none',
  background: '#333',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const markdownContainer = {
  marginTop: '2rem',
  background: '#2c2c2c',
  padding: '1rem',
  borderRadius: '8px',
  overflowX: 'auto',
  color: '#ddd',
  lineHeight: '1.6',
};

export default Itinerary;
