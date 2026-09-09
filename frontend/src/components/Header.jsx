import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, Search, Sun, Moon, Sparkles, Mic, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { useVoice } from '../context/VoiceContext';
import VoiceSettings from './VoiceSettings';
import './Header.css';

const AI_MODES = [
  'General',
  'Coding',
  'Study',
  'Writing',
  'Document Analysis',
  'Brainstorming',
  'Voice Assistant'
];

const AI_MODELS = [
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
];

export default function Header({ sidebarOpen, onToggleSidebar, onSearch }) {
  const { theme, toggleTheme } = useTheme();
  const { selectedMode, setSelectedMode, selectedModel, setSelectedModel, activeConversation } = useChat();
  const { setIsVoiceSettingsOpen } = useVoice();

  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const modeRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modeRef.current && !modeRef.current.contains(e.target)) {
        setModeDropdownOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModelLabel = AI_MODELS.find(m => m.id === selectedModel)?.label || 'Gemini 3.6 Flash';

  return (
    <header className="app-header">
      <VoiceSettings />
      
      <div className="header-left">
        {!sidebarOpen && (
          <button className="btn btn-icon header-btn" id="toggle-sidebar-header" onClick={onToggleSidebar} title="Open sidebar">
            <PanelLeft size={16} />
          </button>
        )}
        {!sidebarOpen && (
          <div className="header-logo">
            <Sparkles size={18} className="logo-icon" />
            <span className="logo-text">Sparkle AI</span>
          </div>
        )}
        {activeConversation && (
          <h1 className="chat-title-header" title={activeConversation.title}>
            {activeConversation.title}
          </h1>
        )}
      </div>

      <div className="header-center">
        {/* Compact Mode Selector Dropdown */}
        <div className="header-dropdown-wrapper" ref={modeRef}>
          <button
            className="mode-pill-btn"
            onClick={() => setModeDropdownOpen(prev => !prev)}
            title="Select Mode"
          >
            <span>{selectedMode}</span>
            <ChevronDown size={13} className={`chevron-icon ${modeDropdownOpen ? 'open' : ''}`} />
          </button>

          {modeDropdownOpen && (
            <div className="header-dropdown-menu">
              <div className="dropdown-menu-header">Select Mode</div>
              {AI_MODES.map(mode => (
                <button
                  key={mode}
                  className={`dropdown-menu-item ${selectedMode === mode ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMode(mode);
                    setModeDropdownOpen(false);
                  }}
                >
                  <span>{mode}</span>
                  {selectedMode === mode && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Compact Model Selector Pill */}
        <div className="header-dropdown-wrapper" ref={modelRef}>
          <button
            className="model-pill-btn"
            onClick={() => setModelDropdownOpen(prev => !prev)}
            title="Select AI Model"
          >
            <span>{activeModelLabel}</span>
            <ChevronDown size={13} className={`chevron-icon ${modelDropdownOpen ? 'open' : ''}`} />
          </button>

          {modelDropdownOpen && (
            <div className="header-dropdown-menu right-aligned">
              <div className="dropdown-menu-header">Select Model</div>
              {AI_MODELS.map(m => (
                <button
                  key={m.id}
                  className={`dropdown-menu-item ${selectedModel === m.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedModel(m.id);
                    setModelDropdownOpen(false);
                  }}
                >
                  <span>{m.label}</span>
                  {selectedModel === m.id && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-icon header-btn" onClick={() => setIsVoiceSettingsOpen(true)} title="Voice Settings">
          <Mic size={16} />
        </button>

        <button className="btn btn-icon header-btn" id="global-search-btn" onClick={onSearch} title="Search (Ctrl+K)">
          <Search size={16} />
        </button>

        <button className="btn btn-icon header-btn" id="toggle-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
