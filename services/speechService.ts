import { Language } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, lang: Language, onEnd?: () => void): void {
  if (!isSpeechSupported() || !text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // 'or-IN' (Odia) voices are rare on most devices; fall back gracefully to default.
  utterance.lang = lang === Language.ODIA ? 'or-IN' : 'en-IN';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}
