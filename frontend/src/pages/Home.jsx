import React, { useState, useEffect } from 'react';

function Home({ location, setLocation }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [savedTrips, setSavedTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('planA_trips')) || [];
    setSavedTrips(stored);

    const savedLocation = localStorage.getItem('planA_location');
    if (savedLocation) setLocation(savedLocation);
  }, [setLocation]);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    localStorage.setItem('planA_location', value);
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    validateDates(value, endDate);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    validateDates(startDate, value);
  };

  const validateDates = (start, end) => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (start && start < today) {
      newErrors.start = 'Start date cannot be in the past';
    }

    if (start && end && end <= start) {
      newErrors.end = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveTrip = () => {
    if (!location || !startDate || !endDate) {
      alert('Please fill out destination and dates before saving.');
      return;
    }

    if (!validateDates(startDate, endDate)) {
      return;
    }

    const newTrip = {
      id: `${location}-${startDate}-${endDate}`,
      location,
      startDate,
      endDate,
    };

    const updatedTrips = [...savedTrips.filter(t => t.id !== newTrip.id), newTrip];
    localStorage.setItem('planA_trips', JSON.stringify(updatedTrips));
    setSavedTrips(updatedTrips);
    setSelectedTripId(newTrip.id);
    alert('Trip saved ✅');
  };

  const updateTrip = () => {
    if (!selectedTripId) return;

    if (!validateDates(startDate, endDate)) {
      return;
    }

    const updatedTrips = savedTrips.map(trip =>
      trip.id === selectedTripId
        ? { ...trip, startDate, endDate }
        : trip
    );

    localStorage.setItem('planA_trips', JSON.stringify(updatedTrips));
    setSavedTrips(updatedTrips);
    alert('Trip updated ✅');
  };

  const deleteTrip = () => {
    if (!selectedTripId) return;
    const updated = savedTrips.filter(t => t.id !== selectedTripId);
    localStorage.setItem('planA_trips', JSON.stringify(updated));
    setSavedTrips(updated);
    setSelectedTripId('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setErrors({});
  };

  const loadTrip = (tripId) => {
    const trip = savedTrips.find(t => t.id === tripId);
    if (!trip) return;
    setSelectedTripId(trip.id);
    setLocation(trip.location);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    localStorage.setItem('planA_location', trip.location);
    setErrors({});
  };

  return (
    <div style={wrapperStyle}>
      <div style={boxStyle}>
        <h2 style={headingStyle}>🧭 Plan A Trip</h2>

        <label style={labelStyle}>Destination:</label>
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="e.g., Tokyo"
          style={inputStyle}
        />

        <label style={labelStyle}>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          style={inputStyle}
        />
        {errors.start && <div style={errorStyle}>{errors.start}</div>}

        <label style={labelStyle}>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          style={inputStyle}
        />
        {errors.end && <div style={errorStyle}>{errors.end}</div>}

        <div style={buttonRowStyle}>
          <button onClick={() => alert('Sync feature coming soon')} style={buttonStyle}>
            📧 Sync with Gmail
          </button>
          <button onClick={saveTrip} style={buttonStyle}>💾 Save Trip</button>
        </div>

        {/* ✅ Update Trip Button */}
        {selectedTripId && (
          <div style={{ width: '100%', marginTop: '0.5rem' }}>
            <button onClick={updateTrip} style={updateButtonStyle}>✏️ Update Trip</button>
          </div>
        )}

        {savedTrips.length > 0 && (
          <div style={{ width: '100%', marginTop: '1.5rem' }}>
            <label style={labelStyle}>📂 Load Saved Trip:</label>
            <select
              value={selectedTripId}
              onChange={(e) => loadTrip(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a trip</option>
              {savedTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.location} ({trip.startDate} → {trip.endDate})
                </option>
              ))}
            </select>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <button onClick={deleteTrip} style={deleteButtonStyle}>
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- STYLES ----------

const wrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  padding: '2rem',
  minHeight: '100vh',
  backgroundColor: '#121212',
  boxSizing: 'border-box',
};

const boxStyle = {
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  background: '#1e1e1e',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 0 10px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const headingStyle = {
  color: 'white',
  marginBottom: '1.2rem',
  fontSize: '1.3rem',
};

const labelStyle = {
  color: 'white',
  fontSize: '0.9rem',
  marginBottom: '0.3rem',
  alignSelf: 'flex-start',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #444',
  background: '#2b2b2b',
  color: 'white',
  boxSizing: 'border-box',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '0.5rem',
  width: '100%',
  marginTop: '1rem',
};

const buttonStyle = {
  flex: 1,
  padding: '0.6rem',
  borderRadius: '6px',
  border: 'none',
  background: '#333',
  color: 'white',
  cursor: 'pointer',
};

const updateButtonStyle = {
  padding: '0.6rem',
  width: '100%',
  backgroundColor: '#2255aa',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '0.4rem 0.8rem',
  backgroundColor: '#991111',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const errorStyle = {
  color: 'salmon',
  fontSize: '0.75rem',
  marginBottom: '0.8rem',
  alignSelf: 'flex-start',
};

export default Home;
