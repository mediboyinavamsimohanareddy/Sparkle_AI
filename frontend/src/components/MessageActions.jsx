import React, { useState } from 'react';
import { Copy, RefreshCw, Check, Edit2, Trash2, Volume2, StopCircle } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

const MessageActions = ({ message, onRegenerate, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const { isSpeaking, speakingMsgId, speakMessage, stopSpeaking, ttsSupported } = useVoice();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAi = message.sender === 'ai';
  const isCurrentlySpeaking = isAi && isSpeaking && speakingMsgId === message.id;

  const toggleSpeak = () => {
    if (isCurrentlySpeaking) {
      stopSpeaking();
    } else {
      speakMessage(message.content, message.id);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '6px',
      opacity: 0.85,
      transition: 'opacity 0.2s ease'
    }}>
      <button onClick={handleCopy} className="btn-icon" title="Copy message" style={{ padding: '4px' }}>
        {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
      </button>

      {isAi && ttsSupported && (
        <button 
          onClick={toggleSpeak} 
          className="btn-icon" 
          title={isCurrentlySpeaking ? "Stop speaking" : "Read aloud"} 
          style={{ padding: '4px', color: isCurrentlySpeaking ? '#ef4444' : 'inherit' }}
        >
          {isCurrentlySpeaking ? <StopCircle size={14} /> : <Volume2 size={14} />}
        </button>
      )}

      {isAi && onRegenerate && (
        <button onClick={onRegenerate} className="btn-icon" title="Regenerate AI response" style={{ padding: '4px' }}>
          <RefreshCw size={14} />
        </button>
      )}

      {!isAi && onEdit && (
        <button onClick={() => onEdit(message)} className="btn-icon" title="Edit message" style={{ padding: '4px' }}>
          <Edit2 size={14} />
        </button>
      )}

      {onDelete && (
        <button onClick={() => onDelete(message.id)} className="btn-icon" title="Delete message" style={{ padding: '4px', color: '#ef4444' }}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default MessageActions;
