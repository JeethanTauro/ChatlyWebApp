import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import AuthService from "../Services/AuthService";
import PrivateChat from "./PrivateChat";

function Chat() {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState("");
  const [privateChat, setPrivateChat] = useState(new Map());
  const [unreadMessages, setUnreadMessages] = useState(new Map());
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [allPrivateMessages, setAllPrivateMessages] = useState(new Map());

  const privateMessagesHandlers = useRef(new Map());
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const openChatsRef = useRef(new Map()); // Track currently open private chats

  const emojis = ["😀", "🎉", "🔥", "🚀", "✨", "💡", "🎶", "🌍", "⚡", "❤️"];

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const { username, color: userColor } = currentUser;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const registerPrivateMessageHandler = useCallback((otherUser, handler) => {
    privateMessagesHandlers.current.set(otherUser, handler);
  }, []);

  const unregisterPrivateMessageHandler = useCallback((otherUser) => {
    privateMessagesHandlers.current.delete(otherUser);
  }, []);

  const connectToWebSocket = useCallback(() => {
    if (stompClient.current && stompClient.current.connected) return;

    setConnectionStatus("Connecting...");

    const socket = new SockJS("http://localhost:8080/ws");
    stompClient.current = Stomp.over(socket);

    stompClient.current.debug = (str) => console.log("STOMP Debug:", str);

    stompClient.current.connect(
      {
        "client-id": username,
        "session-id": Date.now().toString(),
        username: username,
      },
      (frame) => {
        setConnectionStatus("Connected");

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Public messages
        stompClient.current.subscribe("/topic/public", (msg) => {
          try {
            const chatMessage = JSON.parse(msg.body);

            // Typing indicator
            if (chatMessage.type === "TYPING") {
              setIsTyping(chatMessage.sender);
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setIsTyping(""), 2000);
              return;
            }

            // Chat messages
            if (chatMessage.type === "CHAT") {
              setMessages((prev) => [
                ...prev,
                {
                  ...chatMessage,
                  timeStamp: chatMessage.timeStamp || new Date().toISOString(),
                  id: chatMessage.id || `${Date.now()}-${Math.random()}`,
                },
              ]);
              return;
            }

            // JOIN message
            if (chatMessage.type === "JOIN") {
              setOnlineUsers((prev) => {
                const newUsers = new Map(prev);
                newUsers.set(chatMessage.sender, {
                  username: chatMessage.sender,
                  color: chatMessage.color || "#007bff",
                });
                return newUsers;
              });

              if (chatMessage.sender !== username) {
                setMessages((prev) => [
                  ...prev,
                  {
                    ...chatMessage,
                    timeStamp: chatMessage.timeStamp || new Date().toISOString(),
                    id: `join-${chatMessage.sender}-${Date.now()}`,
                  },
                ]);
              }
              return;
            }

            // LEAVE message
            if (chatMessage.type === "LEAVE") {
              setOnlineUsers((prev) => {
                const newUsers = new Map(prev);
                newUsers.delete(chatMessage.sender);
                return newUsers;
              });

              // Only append if not yourself
              if (chatMessage.sender !== username) {
                setMessages((prev) => [
                  ...prev,
                  {
                    ...chatMessage,
                    timeStamp: chatMessage.timeStamp || new Date().toISOString(),
                    id: `leave-${chatMessage.sender}-${Date.now()}`,
                  },
                ]);
              }
              return;
            }
          } catch (error) {
            console.error("Error parsing public message:", error);
          }
        });

        // Private messages
        stompClient.current.subscribe(`/user/${username}/queue/private`, (msg) => {
          try {
            const privateMessage = JSON.parse(msg.body);
            const otherUser =
              privateMessage.sender === username
                ? privateMessage.recipient
                : privateMessage.sender;

            // Save to global store
            setAllPrivateMessages((prev) => {
              const newMap = new Map(prev);
              const msgs = newMap.get(otherUser) || [];
              const messageId = `${privateMessage.sender}-${privateMessage.recipient}-${privateMessage.timeStamp}`;
              if (!msgs.some((m) => m.id === messageId)) {
                msgs.push({ ...privateMessage, id: messageId });
              }
              newMap.set(otherUser, msgs);
              return newMap;
            });

            // Call handler if chat is open
            const handler = privateMessagesHandlers.current.get(otherUser);
            if (handler) handler(privateMessage);
            else if (privateMessage.recipient === username && !openChatsRef.current.has(otherUser)) {
              // Only increment unread if panel is NOT open
              setUnreadMessages((prev) => {
                const newUnread = new Map(prev);
                const currentCount = newUnread.get(otherUser) || 0;
                newUnread.set(otherUser, currentCount + 1);
                return newUnread;
              });
            }
          } catch (error) {
            console.error("Error parsing private message:", error);
          }
        });

        // Global online users
        stompClient.current.subscribe("/topic/onlineUsers", (msg) => {
          try {
            const userList = JSON.parse(msg.body);
            const usersMap = new Map();
            userList.forEach((u) => usersMap.set(u.username, u));
            setOnlineUsers(usersMap);
          } catch (err) {
            console.error("Error parsing online users:", err);
          }
        });

        // Send join message
        const joinMessage = { sender: username, type: "JOIN", color: userColor };
        stompClient.current.send("/app/chat.addUser", {}, JSON.stringify(joinMessage));
      },
      (error) => {
        console.error("STOMP connection error:", error);
        setConnectionStatus("Connection Failed");

        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => connectToWebSocket(), 3000);
        }
      }
    );
  }, [username, userColor]);

  useEffect(() => {
    connectToWebSocket();

    return () => {
      // Only disconnect, do not send LEAVE manually
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect();
      }

      clearTimeout(typingTimeoutRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  useEffect(() => scrollToBottom(), [messages]);

  const openPrivateChat = (otherUser) => {
    if (otherUser === username) return;

    setPrivateChat((prev) => {
      const newChats = new Map(prev);
      newChats.set(otherUser, true);
      openChatsRef.current.set(otherUser, true); // track open immediately
      return newChats;
    });

    setUnreadMessages((prev) => {
      const newUnread = new Map(prev);
      newUnread.delete(otherUser);
      return newUnread;
    });
  };

  const closePrivateChat = (otherUser) => {
    setPrivateChat((prev) => {
      const newChats = new Map(prev);
      newChats.delete(otherUser);
      openChatsRef.current.delete(otherUser); // remove from open chats ref
      return newChats;
    });
    unregisterPrivateMessageHandler(otherUser);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !stompClient.current?.connected) return;

    const chatMessage = {
      sender: username,
      content: message,
      type: "CHAT",
      color: userColor,
    };

    try {
      stompClient.current.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
      setMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (stompClient.current?.connected && e.target.value.trim()) {
      try {
        stompClient.current.send(
          "/app/chat.sendMessage",
          {},
          JSON.stringify({ sender: username, type: "TYPING" })
        );
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timeStamp) =>
    new Date(timeStamp).toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Users ({onlineUsers.size})</h2>
          <div
            className="connection-status"
            style={{
              fontSize: "0.8rem",
              color: connectionStatus === "Connected" ? "#10d876" : "#ff6b6b",
            }}
          >
            {connectionStatus}
          </div>
        </div>
        <div className="users-list">
          {onlineUsers.size === 0 ? (
            <div style={{ textAlign: "center", color: "#a0a0bb", fontStyle: "italic", padding: "1rem" }}>
              No users online
            </div>
          ) : (
            Array.from(onlineUsers.values()).map((user) => (
              <div
                key={user.username}
                className={`user-item ${user.username === username ? "currentUser" : ""}`}
                onClick={() => openPrivateChat(user.username)}
              >
                <div
                  className="user-avatar"
                  style={{
                    backgroundColor: user.username === username ? userColor : user.color || "#007bff",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
                {user.username === username && <span className="you-label">(You)</span>}
                {unreadMessages.has(user.username) && (
                  <span className="unread-count">{unreadMessages.get(user.username)}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="main-chat">
        <div className="chat-header">
          <h2>Welcome {username}</h2>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id || `${msg.sender}-${msg.timeStamp}`} className={`message ${msg.type.toLowerCase()}`}>
              {msg.type === "CHAT" && (
                <div className={`chat-message${msg.sender === username ? " own-message" : ""}`}>
                  <div className="message-info">
                    <span className="sender" style={{ color: msg.color || "#007bff" }}>{msg.sender}</span>
                    <span className="time">{formatTime(msg.timeStamp)}</span>
                  </div>
                  <div className="message-text">{msg.content}</div>
                </div>
              )}

              {(msg.type === "JOIN" || msg.type === "LEAVE") && (
                <div className="system-message">
                  <em>{msg.sender} {msg.type === "JOIN" ? "joined the chat" : "left the chat"}</em>
                </div>
              )}
            </div>
          ))}
          {isTyping && isTyping !== username && <div className="typing-indicator">{isTyping} is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji, index) => (
                <button key={index} onClick={() => addEmoji(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="message-form">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-btn">
              😀
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              className="message-input"
              maxLength={500}
              disabled={!stompClient.current || !stompClient.current.connected}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!message.trim() || !stompClient.current || !stompClient.current.connected}
            />
          </form>
        </div>
      </div>

      {/* Private Chats */}
      {Array.from(privateChat.keys()).map((otherUser) => (
        <PrivateChat
          key={otherUser}
          currentUser={username}
          recipientUser={otherUser}
          userColor={userColor}
          stompClient={stompClient}
          messages={allPrivateMessages.get(otherUser) || []}
          onClose={() => closePrivateChat(otherUser)}
          registerPrivateMessageHandler={registerPrivateMessageHandler}
          unregisterPrivateMessageHandler={unregisterPrivateMessageHandler}
        />
      ))}
    </div>
  );
}

export default Chat;
