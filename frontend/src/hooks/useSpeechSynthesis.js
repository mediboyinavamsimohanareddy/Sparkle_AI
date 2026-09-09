import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Clean Markdown text so SpeechSynthesis sounds natural aloud.
 */
export function cleanTextForSpeech(text) {
  if (!text) return '';

  let clean = text;

  // Replace code blocks with a brief natural phrase
  clean = clean.replace(/```[\s\S]*?```/g, ' [Code block omitted] ');

  // Replace inline code `code` with code
  clean = clean.replace(/`([^`]+)`/g, '$1');

  // Replace markdown links [text](url) with text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove bold/italic markers
  clean = clean.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');

  // Remove headings #
  clean = clean.replace(/^\s*#{1,6}\s+/gm, '');

  // Remove blockquotes >
  clean = clean.replace(/^\s*>\s+/gm, '');

  // Remove list markers (*, -, 1., 2.)
  clean = clean.replace(/^\s*[\*\-\+\d\.]+\s+/gm, '');

  // Remove excessive punctuation/symbols
  clean = clean.replace(/[~`#$%\^&\*()_+\-=\[\]{}|\\<>]/g, ' ');

  // Collapse whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const currentChunksRef = useRef([]);
  const currentChunkIdxRef = useRef(0);

  const stop = useCallback(() => {
    if (isSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingMsgId(null);
    currentChunksRef.current = [];
    currentChunkIdxRef.current = 0;
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const speakNextChunk = useCallback((lang, rate) => {
    const chunks = currentChunksRef.current;
    const idx = currentChunkIdxRef.current;

    if (idx >= chunks.length || !isSupported) {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingMsgId(null);
      return;
    }

    const chunkText = chunks[idx];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = lang || 'en-IN';
    utterance.rate = rate || 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      currentChunkIdxRef.current += 1;
      speakNextChunk(lang, rate);
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis utterance error:', err);
      currentChunkIdxRef.current += 1;
      speakNextChunk(lang, rate);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const speak = useCallback((text, { lang = 'en-IN', rate = 1.0, msgId = null } = {}) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Stop any existing utterance
    stop();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    // Split long text into manageable sentence chunks (under 200 chars)
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    const chunks = [];
    let currentChunk = '';

    for (let s of sentences) {
      if ((currentChunk + ' ' + s).length < 200) {
        currentChunk += (currentChunk ? ' ' : '') + s;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = s;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    currentChunksRef.current = chunks;
    currentChunkIdxRef.current = 0;
    setSpeakingMsgId(msgId);
    setIsSpeaking(true);

    speakNextChunk(lang, rate);
  }, [isSupported, stop, speakNextChunk]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    speakingMsgId,
    isSupported,
    speak,
    stop,
    pause,
    resume
  };
}

export default useSpeechSynthesis;
