import React from 'react';
import { X, Mic, Volume2, Globe, Settings2 } from 'lucide-react';
import { useVoice, VOICE_LANGUAGES, SPEECH_RATES } from '../context/VoiceContext';
import './VoiceSettings.css';

export default function VoiceSettings() {
  const {
    isVoiceSettingsOpen,
    setIsVoiceSettingsOpen,
    voiceInputEnabled,
    setVoiceInputEnabled,
    voiceLanguage,
    setVoiceLanguage,
    readAloud,
    setReadAloud,
    speechRate,
    setSpeechRate
  } = useVoice();

  if (!isVoiceSettingsOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsVoiceSettingsOpen(false)}>
      <div className="modal-content voice-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings2 size={18} />
            <span>Voice Settings</span>
          </div>
          <button className="btn-icon" onClick={() => setIsVoiceSettingsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Voice Input Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Voice Input (Microphone)</div>
              <div className="setting-desc">Allow speaking to Sparkle AI using your microphone.</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={voiceInputEnabled} 
                onChange={e => setVoiceInputEnabled(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Read Aloud Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Read Aloud (Text-to-Speech)</div>
              <div className="setting-desc">Automatically speak Sparkle AI's replies.</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={readAloud} 
                onChange={e => setReadAloud(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="setting-divider" />

          {/* Voice Language */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label"><Globe size={16}/> Voice Language</div>
              <div className="setting-desc">Language used for speech recognition and reading.</div>
            </div>
            <select 
              className="setting-select" 
              value={voiceLanguage} 
              onChange={e => setVoiceLanguage(e.target.value)}
            >
              {VOICE_LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* Speech Rate */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Speech Speed ({speechRate}x)</div>
              <div className="setting-desc">Speed at which Sparkle AI speaks.</div>
            </div>
            <select 
              className="setting-select" 
              value={speechRate} 
              onChange={e => setSpeechRate(parseFloat(e.target.value))}
            >
              {SPEECH_RATES.map(rate => (
                <option key={rate.value} value={rate.value}>{rate.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
