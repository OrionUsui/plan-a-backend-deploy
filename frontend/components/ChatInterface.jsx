import React, { useState } from 'react';

function ChatInterface({ location }) {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: `You are a helpful travel planner. The user's trip location is ${location}.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '⚠️ No response received.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Error talking to server.' }]);
    }

    setLoading(false);
  };

  return (
    <div style={chatContainerStyle}>
      <h3 style={{ marginBottom: '0.5rem' }}>💬 Customize Your Trip</h3>
      <div style={chatBoxStyle}>
        {messages.slice(1).map((msg, index) => (
          <div
            key={index}
            style={{
              ...bubbleStyle,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#333' : '#2b2b2b',
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div style={{ color: '#888' }}>Loading...</div>}
      </div>
      <div style={inputRowStyle}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask to change days, add sights, etc."
          style={inputStyle}
        />
        <button onClick={sendMessage} style={buttonStyle} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

// ---------- STYLES ----------
const chatContainerStyle = {
  marginTop: '2rem',
  paddingTop: '1rem',
  borderTop: '1px solid #444',
};

const chatBoxStyle = {
  maxHeight: '300px',
  overflowY: 'auto',
  marginBottom: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const bubbleStyle = {
  padding: '0.6rem',
  borderRadius: '8px',
  maxWidth: '80%',
  color: 'white',
};

const inputRowStyle = {
  display: 'flex',
  gap: '0.5rem',
};

const inputStyle = {
  flex: 1,
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #444',
  background: '#1e1e1e',
  color: 'white',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  background: '#444',
  color: 'white',
  cursor: 'pointer',
};

export default ChatInterface;
