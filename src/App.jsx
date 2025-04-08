import React, { useState, useEffect, useRef } from 'react';
import "./App.css";
import echo from "./echo";

function App() {
  const chatRef = useRef();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  // Listen for new messages
  useEffect(() => {
    if (!selectedUserId) return;

    const channel = echo.channel(`chat.${selectedUserId}`);

    channel.listen("MessageReceived", (e) => {
      console.log("📨 New message via Echo:", e.message);
      alert("New message received!");
      setChat((prev) => [...prev, e.message]);
    });

    return () => {
      echo.leave(`chat.${selectedUserId}`);
    };
  }, [selectedUserId]);

  // Fetch unique users
  useEffect(() => {
    fetch("http://localhost:8000/api/chat/users") // Laravel endpoint
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  // Fetch selected user's chat
  useEffect(() => {
    if (selectedUserId) {
      fetch(`http://localhost:8000/api/chat/messages/${selectedUserId}`)
        .then((res) => res.json())
        .then(setChat);
    }
  }, [selectedUserId]);

  // Send message
  const handleSend = async () => {
    const res = await fetch(`http://localhost:8000/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: selectedUserId, message }),
    });

    if (res.ok) {
      setMessage("");
      setChat([...chat, { sender_id: "you", message_text: message }]);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h3>Users</h3>
        <ul>
          {users.map((u) => (
            <li
              key={u.sender_id}
              onClick={() => setSelectedUserId(u.sender_id)}
            >
              {u.sender_id}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-box">
        <h3>
          Chat with:{" "}
          {selectedUserId
            ? users.find((u) => u.sender_id === selectedUserId)?.name ||
              selectedUserId
            : "..."}
        </h3>
        <div className="chat-messages" ref={chatRef}>
          {chat.map((msg, index) => {
            const isYou = msg.sender_id === "you";
            return (
              <div
                key={index}
                className={`chat-bubble ${isYou ? "you" : "them"}`}
              >
                <div className="chat-meta">
                  <strong>{isYou ? "You" : "them"}</strong>
                  <span className="chat-time">
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="chat-text">{msg.message_text}</div>
              </div>
            );
          })}
        </div>

        {selectedUserId && (
          <div className="chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
