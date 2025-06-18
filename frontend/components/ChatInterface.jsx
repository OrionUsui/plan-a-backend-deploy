import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function ChatInterface({ location, selectedTripId, onUpdateItinerary, initialMessages = [], initialItinerary = '' }) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful travel planner. Please respond ONLY with a structured itinerary in this format:

Day 1:
- Morning: ...
- Afternoon: ...
- Evening: ...

Day 2:
- Morning: ...
- Afternoon: ...
- Evening: ...

For any recommended restaurants, landmarks, or attractions, include clickable Markdown links like [Shibuya Crossing](https://maps.google.com/...).

Do NOT include any explanations, greetings, or follow-up questions. Only provide the formatted itinerary. The user's trip location is ${location}, and here is the original itinerary to use as context: \n\n${initialItinerary}`,
  };

  const [messages, setMessages] = useState([systemMessage, ...initialMessages]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAssistantMessage, setLastAssistantMessage] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!selectedTripId || !location) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/itinerary-store?tripId=${selectedTripId}`);
        const data = await res.json();

        if (res.ok) {
          const history = data.chatHistory?.length ? data.chatHistory : [];
          const assistantMsgs = history.filter((m) => m.role === 'assistant');
          setMessages([systemMessage, ...history]);
          setLastAssistantMessage(assistantMsgs[assistantMsgs.length - 1] || null);
        } else {
          console.warn('Failed to load chat:', data.error);
          setMessages([systemMessage]);
        }
      } catch (err) {
        console.error('Error loading chat:', err);
        setMessages([systemMessage]);
      }
    };

    fetchData();
  }, [selectedTripId, location, initialItinerary]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const stripFluff = (text) => {
    return text
      .replace(/^.*?(Day\s*\d+:)/is, '$1')
      .replace(/(Let me know.*|Please let me know.*|If you have questions.*)/gi, '')
      .trim();
  };

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
        const cleanReply = stripFluff(data.reply);
        const assistantMsg = { role: 'assistant', content: cleanReply };
        const updatedMessages = [...newMessages, assistantMsg];

        setMessages(updatedMessages);
        setLastAssistantMessage(assistantMsg);

        await fetch('/api/itinerary-store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: selectedTripId,
            chatHistory: updatedMessages,
          }),
        });
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '⚠️ No response received.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Error talking to server.' }]);
    }

    setLoading(false);
  };

  const handleUseThisItinerary = async () => {
    if (!lastAssistantMessage || !selectedTripId) return;

    try {
      await fetch('/api/itinerary-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTripId,
          itinerary: lastAssistantMessage.content,
          chatHistory: messages.slice(1), // omit system message
        }),
      });

      onUpdateItinerary(lastAssistantMessage.content);
      setSaveStatus('✔ Itinerary and chat history saved!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Failed to save itinerary:', err);
      setSaveStatus('⚠️ Save failed');
    }
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
            {msg.role === 'assistant' ? (
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
                {msg.content}
              </ReactMarkdown>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            )}
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
          {saveStatus && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#2ecc71' }}>{saveStatus}</div>
          )}
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
  wordBreak: 'break-word',
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
