import React, { useEffect, useState } from 'react';
import ChatInterface from '../../components/ChatInterface';

function Itinerary({ location, setLocation, selectedTripId, setSelectedTripId }) {
  const [savedTrips, setSavedTrips] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('planA_trips')) || [];
    setSavedTrips(stored);

    if (stored.length > 0 && !selectedTripId) {
      setSelectedTripId(stored[0].id);
      setLocation(stored[0].location);
    }
  }, [setLocation, selectedTripId, setSelectedTripId]);

  useEffect(() => {
    const trip = savedTrips.find(t => t.id === selectedTripId);
    if (trip) {
      setLocation(trip.location);
    }
  }, [selectedTripId]);

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
          userInput: userInput || ''
        })
      });

      if (!response.ok) throw new Error(`Server returned status ${response.status}`);

      const data = await response.json();
      setItinerary(data.itinerary || '⚠️ No itinerary found in response.');
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
            const trip = savedTrips.find(t => t.id === tripId);
            if (trip) {
              setLocation(trip.location);
            }
          }}
          style={inputStyle}
        >
          <option value="">-- Select a trip --</option>
          {savedTrips.map(trip => (
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
          onClick={() => generateItinerary(savedTrips.find(t => t.id === selectedTripId))}
          disabled={loading || !selectedTripId}
          style={buttonStyle}
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>

        {itinerary && <pre style={itineraryStyle}>{itinerary}</pre>}

        {/* ✅ Chat appears after itinerary is generated */}
        {itinerary && (
<ChatInterface
  location={location}
  selectedTripId={selectedTripId} // ✅ required!
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

const itineraryStyle = {
  marginTop: '2rem',
  whiteSpace: 'pre-wrap',
  background: '#2c2c2c',
  padding: '1rem',
  borderRadius: '8px',
  overflowX: 'auto',
  color: '#ddd',
};

export default Itinerary;
