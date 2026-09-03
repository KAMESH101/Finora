import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechState = 'idle' | 'speaking' | 'stopped';

export function useSpeechSynthesis() {
  const [state, setState] = useState<SpeechState>('idle');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setState('speaking');
      utterance.onend = () => setState('idle');
      utterance.onerror = () => setState('idle');
      utteranceRef.current = utterance;
      // Some browsers don't reliably fire onstart — reflect "speaking" as
      // soon as we ask, so the speaker button never looks unresponsive.
      setState('speaking');
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setState('stopped');
    setTimeout(() => setState('idle'), 150);
  }, [supported]);

  return { speak, stop, state, supported };
}
