import React from 'react';
import { BookOpen, Code2, FileText, Lightbulb } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import NovaOrb from './NovaOrb';
import './WelcomeScreen.css';

const SUGGESTIONS = [
  { icon: <BookOpen size={15} />, label: 'Explain a concept', prompt: 'Explain a concept step by step:', mode: 'Study' },
  { icon: <Code2 size={15} />, label: 'Write code', prompt: 'Write code for:', mode: 'Coding' },
  { icon: <FileText size={15} />, label: 'Analyze a file', prompt: 'Analyze this file and summarize key insights:', mode: 'Document Analysis' },
  { icon: <Lightbulb size={15} />, label: 'Brainstorm ideas', prompt: 'Brainstorm creative ideas for:', mode: 'Brainstorming' },
];

export default function WelcomeScreen() {
  const { sendMessage, setSelectedMode } = useChat();

  const handleSuggestion = async (s) => {
    setSelectedMode(s.mode);
    await sendMessage({ prompt: s.prompt });
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-glow" />

      <div className="welcome-orb-wrapper">
        <NovaOrb size="md" state="idle" interactive={false} />
      </div>

      <h1 className="welcome-title">How can I help?</h1>
      <p className="welcome-subtitle">
        Ask Sparkle AI anything — or use the tools below.
      </p>

      <div className="suggestions-pills">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            id={`suggestion-pill-${i}`}
            className="suggestion-pill"
            onClick={() => handleSuggestion(s)}
          >
            <span className="pill-icon">{s.icon}</span>
            <span className="pill-text">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
