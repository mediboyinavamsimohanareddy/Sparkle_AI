import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useVoice } from '../context/VoiceContext';
import MarkdownRenderer from './MarkdownRenderer';
import MessageActions from './MessageActions';
import NovaOrb from './NovaOrb';
import { User, Sparkles } from 'lucide-react';
import './MessageBubble.css';

export default function MessageBubble({ message, isLast }) {
  const { regenerateResponse } = useChat();
  const {
    readAloud,
    speakMessage,
    speakingMsgId,
    isSpeaking
  } = useVoice();

  const isAi = message.sender === 'ai';
  const isCurrentlySpeaking = isAi && isSpeaking && speakingMsgId === message.id;

  // Auto-read aloud if enabled
  const hasSpokenRef = useRef(false);
  useEffect(() => {
    if (isAi && isLast && readAloud && !hasSpokenRef.current && message.content) {
      hasSpokenRef.current = true;
      // Small delay to ensure smooth UX
      setTimeout(() => speakMessage(message.content, message.id), 500);
    }
  }, [isAi, isLast, readAloud, message.content, message.id, speakMessage]);

  return (
    <div className={`message-row ${isAi ? 'ai-row' : 'user-row'}`}>
      <div className={`message-bubble-wrapper ${isAi ? 'ai-wrapper' : 'user-wrapper'}`}>
        {/* Avatar */}
        <div className={`avatar ${isAi ? 'ai-avatar' : 'user-avatar'} ${isCurrentlySpeaking ? 'speaking-avatar' : ''}`}>
          {isAi ? (
            isCurrentlySpeaking ? <NovaOrb state="speaking" size="sm" /> : <Sparkles size={14} />
          ) : (
            <User size={14} />
          )}
        </div>

        <div className={`bubble ${isAi ? 'ai-bubble' : 'user-bubble'} ${isCurrentlySpeaking ? 'bubble-speaking' : ''}`}>
          {/* File/Image attachment indicator */}
          {message.fileName && (
            <div className="msg-file-badge">
              📎 {message.fileName}
            </div>
          )}
          {message.imageUrl && (
            <div className="msg-image-preview">
              <img src={message.imageUrl} alt="Attached" />
            </div>
          )}

          {isAi ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <p className="user-text">{message.content}</p>
          )}

          <MessageActions
            message={message}
            onRegenerate={isAi && isLast ? regenerateResponse : null}
          />
        </div>
      </div>
    </div>
  );
}
