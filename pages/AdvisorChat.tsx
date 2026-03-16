import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCareerAdvice } from '../src/services/geminiService';
import { ChatMessage } from '../types';
import { useUser } from '../App';

const AdvisorChat: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: `Hi ${user?.name.split(' ')[0]}! I'm your Study Buddy. I can help with homework, explain concepts, suggest study strategies, or prep you for exams. What do you need help with?` }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getCareerAdvice([...messages, userMessage], user);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Clear conversation history?')) {
      setMessages([{ role: 'assistant', content: `Chat cleared. How else can I help you today, ${user?.name.split(' ')[0]}?` }]);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors">
      <header className="px-8 py-5 border-b dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="font-bold text-xl dark:text-white">Study Buddy</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-500 font-bold uppercase tracking-widest">Ready to help you learn</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all">
          <Trash2 size={20} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <div className={`flex gap-5 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border dark:border-slate-800 ${msg.role === 'user' ? 'bg-white dark:bg-slate-800 text-gray-600' : 'bg-brand-600 text-white'
                }`}>
                {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={`p-6 rounded-3xl text-base leading-relaxed shadow-sm overflow-hidden ${msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 rounded-tl-none border dark:border-slate-800'
                }`}>
                <div className={`prose dark:prose-invert max-w-none ${msg.role === 'user' ? 'prose-p:text-white prose-headings:text-white prose-strong:text-white' : ''}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="p-6 rounded-3xl bg-gray-50 dark:bg-slate-900 text-gray-400 text-sm italic border dark:border-slate-800">
                Thinking about your question...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto flex gap-4">
          <input
            type="text"
            className="flex-1 p-5 border dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none bg-white dark:bg-slate-800 dark:text-white shadow-sm transition-all text-lg"
            placeholder={`Ask about any subject, concept, or study strategy...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="p-5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 disabled:bg-gray-400 disabled:shadow-none active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-6 uppercase font-black tracking-[0.2em]">
          Powered by Gemini 3 Flash Precision AI
        </p>
      </div>
    </div>
  );
};

export default AdvisorChat;