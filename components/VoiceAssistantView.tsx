import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic, MicOff, Volume2, Bot, User } from 'lucide-react';
import { UIContent, Language, ChatMessage } from '../types';
import { askFarmingQuestion } from '../services/geminiService';
import { startListening, isVoiceInputSupported, VoiceListenHandle } from '../services/speechRecognitionService';
import { speak } from '../services/speechService';

interface VoiceAssistantViewProps {
  content: UIContent;
  lang: Language;
}

const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const listenHandle = useRef<VoiceListenHandle | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const voiceSupported = isVoiceInputSupported();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text: trimmed, timestamp: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setThinking(true);

    try {
      const answer = await askFarmingQuestion(trimmed, lang, nextMessages);
      const botMsg: ChatMessage = { id: `${Date.now()}-a`, role: 'assistant', text: answer, timestamp: Date.now() };
      setMessages((prev) => [...prev, botMsg]);
      speak(answer, lang);
    } catch {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: 'assistant',
        text: isOdia ? 'କ୍ଷମା କରନ୍ତୁ, କିଛି ତ୍ରୁଟି ହେଲା।' : 'Sorry, something went wrong.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setThinking(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      listenHandle.current?.stop();
      setListening(false);
      return;
    }
    setListening(true);
    listenHandle.current = startListening(
      lang,
      (transcript) => {
        setListening(false);
        send(transcript);
      },
      () => setListening(false),
      () => setListening(false)
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-4 pb-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center pt-16 px-6">
            <Bot className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <p className={`text-slate-500 dark:text-slate-400 text-sm ${isOdia ? 'font-odia' : ''}`}>
              {isOdia ? 'ଯେକୌଣସି କୃଷି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ — ଉଦାହରଣ: "ମୋ ଟମାଟୋ ପତ୍ର ମୋଡ଼ି ଯାଉଛି"' : 'Ask any farming question — e.g. "My tomato leaves are curling"'}
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
              } ${isOdia ? 'font-odia' : ''}`}
            >
              {m.text}
              {m.role === 'assistant' && (
                <button onClick={() => speak(m.text, lang)} className="ml-2 inline-block align-middle text-indigo-400 hover:text-indigo-600">
                  <Volume2 className="w-3.5 h-3.5 inline" />
                </button>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div className={`text-xs text-slate-400 ml-9 ${isOdia ? 'font-odia' : ''}`}>{content.voiceAssistantThinking}</div>
        )}
      </div>

      {!voiceSupported && (
        <p className={`text-xs text-amber-600 dark:text-amber-400 text-center px-4 pb-1 ${isOdia ? 'font-odia' : ''}`}>
          {content.voiceAssistantMicUnsupported}
        </p>
      )}

      <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 flex items-center gap-2">
        {voiceSupported && (
          <button
            onClick={toggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder={listening ? content.voiceAssistantListening : content.voiceAssistantPlaceholder}
          className={`flex-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-full px-4 py-2.5 text-sm outline-none focus:border-emerald-400 ${isOdia ? 'font-odia' : ''}`}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistantView;
