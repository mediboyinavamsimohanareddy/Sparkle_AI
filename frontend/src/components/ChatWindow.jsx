import React, { useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import './ChatWindow.css';

export default function ChatWindow() {
  const { activeConversation, loading } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const messages = activeConversation?.messages || [];

  return (
    <div className="chat-window" id="chat-window">
      <div className="messages-area" id="messages-area">
        {!activeConversation && !loading ? (
          <WelcomeScreen />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
                isLast={i === messages.length - 1}
              />
            ))}
            {loading && (
              <div className="ai-typing-indicator">
                <div className="typing-avatar">
                  <span>✨</span>
                </div>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <ChatInput />
    </div>
  );
}
