import { useCallback, useRef, useState } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const resultReceivedRef = useRef(false);

  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const start = useCallback(
    (onResult: (text: string) => void) => {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      resultReceivedRef.current = false;

      if (!SpeechRecognitionCtor) {
        setError('Voice recognition is not supported in this browser. Try Chrome or Edge, or type your command instead.');
        return;
      }

      // Web Speech API requires a secure context (HTTPS or localhost).
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Voice recognition requires HTTPS. Please type your command instead.');
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let finalText = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += chunk;
          } else {
            interim += chunk;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (finalText) {
          resultReceivedRef.current = true;
          setTranscript(finalText);
          setInterimTranscript('');
          onResult(finalText);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const code = event?.error;
        if (code === 'not-allowed' || code === 'permission-denied' || code === 'service-not-allowed') {
          setError('Microphone access was denied. Please allow microphone access to use voice payments.');
        } else if (code === 'no-speech') {
          setError("Didn't catch that — no speech detected. Try again, or type your command.");
        } else if (code === 'audio-capture') {
          setError('No microphone was found. Please check your microphone, or type your command.');
        } else if (code === 'network') {
          setError('Voice recognition needs an internet connection. Please type your command instead.');
        } else if (code === 'language-not-supported') {
          setError('Voice language not supported on this device. Please type your command instead.');
        } else {
          setError('Could not understand. Please try again, or type your command.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Some browsers end the session without ever firing onresult
        // (e.g. very short/quiet audio) and without a clean onerror either.
        if (!resultReceivedRef.current) {
          setError((prev) => prev ?? "Didn't catch that. Try again, or type your command.");
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setError('Could not start voice recognition. Please type your command instead.');
      }
    },
    [SpeechRecognitionCtor]
  );

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  return {
    start,
    stop,
    transcript,
    interimTranscript,
    isListening,
    error,
    supported: !!SpeechRecognitionCtor,
  };
}
