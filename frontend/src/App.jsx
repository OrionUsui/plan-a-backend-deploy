import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import Map from './pages/Map';
import Itinerary from './pages/Itinerary';
import Account from './pages/Account';

function App() {
  const location = useLocation();

  // ✅ Shared state
  const [tripLocation, setTripLocation] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  const tabs = [
    { path: '/', label: 'PlanA Trip', icon: '🧭' },
    { path: '/itinerary', label: 'Itinerary', icon: '📘' },
    { path: '/map', label: 'Map', icon: '🗺️' },
    { path: '/account', label: 'Account', icon: '👤' }
  ];

  return (
    <div style={{ paddingBottom: '70px' }}>
      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              location={tripLocation}
              setLocation={setTripLocation}
              selectedTripId={selectedTripId}
              setSelectedTripId={setSelectedTripId}
            />
          }
        />
        <Route
          path="/itinerary"
          element={
            <Itinerary
              location={tripLocation}
              setLocation={setTripLocation}
              selectedTripId={selectedTripId}
              setSelectedTripId={setSelectedTripId}
            />
          }
        />
        <Route
          path="/map"
          element={<Map location={tripLocation} />}
        />
        <Route path="/account" element={<Account />} />
      </Routes>

      {/* Bottom Navigation */}
      <nav style={navStyle}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                ...tabStyle,
                background: isActive ? '#444' : 'transparent',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              <div style={{ fontSize: '1.2rem' }}>{tab.icon}</div>
              <div style={{ fontSize: '0.75rem' }}>{tab.label}</div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60px',
  background: '#222',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  borderTop: '1px solid #333',
  zIndex: 1000
};

const tabStyle = {
  flex: 1,
  color: 'white',
  textAlign: 'center',
  textDecoration: 'none',
  padding: '0.4rem 0.2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

export default App;
