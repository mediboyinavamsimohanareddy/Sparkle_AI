import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const VoiceContext = createContext();

export const VOICE_LANGUAGES = [
  { id: 'en-US', label: 'English (US)' },
  { id: 'en-IN', label: 'English (India)' },
  { id: 'te-IN', label: 'Telugu (India)' },
  { id: 'hi-IN', label: 'Hindi (India)' }
];

export const SPEECH_RATES = [
  { value: 0.8, label: 'Slow (0.8x)' },
  { value: 1.0, label: 'Normal (1.0x)' },
  { value: 1.25, label: 'Fast (1.25x)' }
];

export const VoiceProvider = ({ children }) => {
  const [voiceLanguage, setVoiceLanguage] = useState(() => {
    return localStorage.getItem('nova_voice_lang') || 'en-IN';
  });

  const [readAloud, setReadAloud] = useState(() => {
    return localStorage.getItem('nova_read_aloud') === 'true';
  });

  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('nova_speech_rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [voiceInputEnabled, setVoiceInputEnabled] = useState(() => {
    const saved = localStorage.getItem('nova_voice_input');
    return saved !== 'false';
  });

  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  const tts = useSpeechSynthesis();

  useEffect(() => {
    localStorage.setItem('nova_voice_lang', voiceLanguage);
  }, [voiceLanguage]);

  useEffect(() => {
    localStorage.setItem('nova_read_aloud', readAloud ? 'true' : 'false');
  }, [readAloud]);

  useEffect(() => {
    localStorage.setItem('nova_speech_rate', speechRate.toString());
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('nova_voice_input', voiceInputEnabled ? 'true' : 'false');
  }, [voiceInputEnabled]);

  const speakMessage = (text, msgId) => {
    tts.speak(text, {
      lang: voiceLanguage,
      rate: speechRate,
      msgId
    });
  };

  return (
    <VoiceContext.Provider value={{
      voiceLanguage,
      setVoiceLanguage,
      readAloud,
      setReadAloud,
      speechRate,
      setSpeechRate,
      voiceInputEnabled,
      setVoiceInputEnabled,
      isVoiceSettingsOpen,
      setIsVoiceSettingsOpen,
      // TTS methods and states
      isSpeaking: tts.isSpeaking,
      speakingMsgId: tts.speakingMsgId,
      ttsSupported: tts.isSupported,
      speakMessage,
      stopSpeaking: tts.stop,
      pauseSpeaking: tts.pause,
      resumeSpeaking: tts.resume
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
