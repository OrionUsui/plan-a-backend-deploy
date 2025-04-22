import React from 'react';

function Account() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#121212',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#1e1e1e',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 0 10px rgba(0,0,0,0.4)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>👤 Account</h2>
        <p>Account features coming soon...</p>
      </div>
    </div>
  );
}

export default Account;
