import React, { useEffect, useState, useRef } from 'react';

function PrivateChat({
  currentUser,
  recipientUser,
  userColor,
  stompClient,
  messages, // now received from parent
  onClose,
  registerPrivateMessageHandler,
  unregisterPrivateMessageHandler
}) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const sendPrivateMessage = (e) => {
    e.preventDefault();
    if (message.trim() && stompClient.current && stompClient.current.connected) {
      const timeStamp = new Date();
      const privateMessage = {
        sender: currentUser,
        recipient: recipientUser,
        content: message.trim(),
        type: 'PRIVATE_CHAT',
        color: userColor,
        timeStamp
      };

      try {
        stompClient.current.send('/app/chat.sendPrivateMessage', {}, JSON.stringify(privateMessage));
        setMessage('');
      } catch (error) {
        console.error('Error sending message in private chat', error);
      }
    }
  };

  const formatTime = (timeStamp) => {
    return new Date(timeStamp).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="private-chat-window">
      <div className="private-chat-header">
        <div className="recipient-info">
          <div className="recipient-avatar">{recipientUser.charAt(0).toUpperCase()}</div>
          <h3>{recipientUser}</h3>
        </div>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="private-message-container">
        {messages.length === 0 ? (
          <div className="no-message"><p>No messages yet. Start the conversation.</p></div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`private-message ${msg.sender === currentUser ? 'own-message' : 'received-message'}`}
            >
              <div className="message-header">
                <span className="sender-name" style={{ color: msg.color || '#6b73FF' }}>
                  {msg.sender === currentUser ? 'You' : msg.sender}
                </span>
                <span className="timeStamp">{formatTime(msg.timeStamp)}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="private-message-input-container">
        <form onSubmit={sendPrivateMessage} className="private-message-form">
          <input
            type="text"
            placeholder={`Message ${recipientUser}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="private-message-input"
            maxLength={1000}
          />
          <button type="submit" disabled={!message.trim()} className="private-send-button">Send</button>
        </form>
      </div>
    </div>
  );
}

export default PrivateChat;
