import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognitionRef = useRef(null);

  const SpeechRecognition = typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const isSupported = !!SpeechRecognition;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore if already stopped
      }
    }
    setIsListening(false);
  }, []);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        // ignore
      }
    }
    setIsListening(false);
    setTranscript('');
    setError('');
  }, []);

  const startListening = useCallback(({ lang = 'en-IN' } = {}) => {
    setError('');
    setPermissionDenied(false);

    if (!isSupported) {
      setError('Voice input is not supported in this browser. You can type your message instead.');
      return;
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            finalTranscript += result[0].transcript;
          }
        }
        setTranscript(finalTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
          setError('Microphone permission is required for voice input.');
        } else if (event.error === 'no-speech') {
          setError("Sorry, I couldn't hear that. Please try again.");
        } else if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start microphone. Please check permissions.');
      setIsListening(false);
    }
  }, [isSupported, SpeechRecognition]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    error,
    permissionDenied,
    isSupported,
    startListening,
    stopListening,
    cancelListening,
  };
}

export default useSpeechRecognition;
