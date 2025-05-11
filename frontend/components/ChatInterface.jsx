import React, { useState, useEffect, useRef } from 'react';

function ChatInterface({ location, selectedTripId, onUpdateItinerary, initialMessages = [] }) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful travel planner. The user's trip location is ${location}. Please provide the itinerary in a clearly structured markdown-style format.`,
  };

  const [messages, setMessages] = useState(initialMessages.length > 0 ? initialMessages : [systemMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAssistantMessage, setLastAssistantMessage] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!selectedTripId || !location) return;

    const chatKey = `chat_${selectedTripId}`;
    const savedChat = localStorage.getItem(chatKey);
    const itineraryKey = `itinerary_${selectedTripId}`;
    const savedItinerary = localStorage.getItem(itineraryKey);

    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        setMessages(parsed);
        const assistantMsgs = parsed.filter((m) => m.role === 'assistant');
        setLastAssistantMessage(assistantMsgs[assistantMsgs.length - 1] || null);
      } catch {
        setMessages([systemMessage]);
        setLastAssistantMessage(null);
      }
    } else if (savedItinerary) {
      try {
        const parsed = JSON.parse(savedItinerary);
        const newMessages = [systemMessage, { role: 'assistant', content: parsed.content }];
        setMessages(newMessages);
        setLastAssistantMessage({ role: 'assistant', content: parsed.content });
      } catch {
        setMessages([systemMessage]);
        setLastAssistantMessage(null);
      }
    } else {
      setMessages([systemMessage]);
      setLastAssistantMessage(null);
    }
  }, [selectedTripId, location]);

  useEffect(() => {
    if (!selectedTripId || messages.length === 0) return;
    localStorage.setItem(`chat_${selectedTripId}`, JSON.stringify(messages));
  }, [messages, selectedTripId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        const assistantMsg = { role: 'assistant', content: data.reply };
        setMessages([...newMessages, assistantMsg]);
        setLastAssistantMessage(assistantMsg);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '⚠️ No response received.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Error talking to server.' }]);
    }

    setLoading(false);
  };

  const handleUseThisItinerary = () => {
    if (!lastAssistantMessage || !selectedTripId) return;
    localStorage.setItem(`itinerary_${selectedTripId}`, JSON.stringify(lastAssistantMessage));
    localStorage.setItem(`chat_${selectedTripId}`, JSON.stringify(messages));
    onUpdateItinerary(lastAssistantMessage.content);
    setSaveStatus('✔ Itinerary and chat history saved!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const formatAssistantText = (text) => {
    return text
      .replace(/(\*\*.*?\*\*)/g, '\n\n$1')
      .replace(/(?:Day \d+|Morning|Afternoon|Evening):/g, (match) => `\n${match}`);
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
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.role === 'assistant' ? formatAssistantText(msg.content) : msg.content}
          </div>
        ))}
        {loading && <div style={{ color: '#888' }}>Loading...</div>}
        <div ref={chatEndRef} />
      </div>

      <div style={inputRowStyle}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask to suggest new locations, add sights, etc."
          style={inputStyle}
        />
        <button onClick={sendMessage} style={buttonStyle} disabled={loading}>
          Send
        </button>
      </div>

      {lastAssistantMessage && (
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={handleUseThisItinerary} style={updateButtonStyle}>
            📋 Use This Itinerary
          </button>
          {saveStatus && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#2ecc71' }}>{saveStatus}</div>}
        </div>
      )}
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
  maxHeight: '50vh',
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

const updateButtonStyle = {
  padding: '0.4rem 0.8rem',
  backgroundColor: '#2255aa',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export default ChatInterface;
