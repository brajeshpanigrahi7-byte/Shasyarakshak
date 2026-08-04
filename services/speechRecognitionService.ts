import { Language } from '../types';

// Chrome/Edge/Safari expose this under a vendor prefix; not all browsers support it.
type SpeechRecognitionCtor = new () => any;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceInputSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface VoiceListenHandle {
  stop: () => void;
}

export function startListening(
  lang: Language,
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError?: (error: string) => void
): VoiceListenHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    onError?.('unsupported');
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = lang === Language.ODIA ? 'or-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript;
    if (transcript) onResult(transcript);
  };
  recognition.onerror = (event: any) => onError?.(event.error || 'unknown');
  recognition.onend = () => onEnd();

  try {
    recognition.start();
  } catch {
    onError?.('start_failed');
    return null;
  }

  return { stop: () => recognition.stop() };
}
