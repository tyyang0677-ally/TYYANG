
import React, { useState, useRef, useEffect, memo } from 'react';
import { Send, Bot, User, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { marked } from 'marked';

// Memoized Message Component to prevent unnecessary re-renders
const MessageItem = memo(({ msg, isStreaming = false }: { msg: ChatMessage, isStreaming?: boolean }) => {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-1 ${
          isUser ? 'bg-blue-600 ml-4' : 'bg-slate-100 mr-4'
        }`}>
          {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-slate-600" />}
        </div>
        <div className={`p-6 md:p-8 rounded-[2rem] shadow-sm transition-all ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none text-sm font-bold leading-relaxed' 
            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 markdown-content text-[14px] shadow-md'
        }`}>
          {isUser ? (
            <p>{msg.text}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
          )}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
});

interface AIAssistantProps {
  onMessageSent: (role: 'user' | 'model', text: string) => void;
  history: ChatMessage[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onMessageSent, history }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    marked.setOptions({ gfm: true, breaks: true });
  }, []);

  // Smoother auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'auto'
      });
    }
  }, [history, streamingText, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    onMessageSent('user', userInput);
    setIsLoading(true);
    setStreamingText('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: userInput,
        config: {
          systemInstruction: "你是一个专业的学术辅助AI。请以清晰且具有层级感的Markdown格式回答。必须使用标题(## 或 ###)、列表项、加粗(**)和学术引用(>)。确保回复看起来像是一份精心排版的学术报告大纲或深度解析文档。",
        }
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setStreamingText(fullText); // Update local stream state for smooth UI
      }

      // Once done, commit to global history
      onMessageSent('model', fullText);
      setStreamingText('');
    } catch (error) {
      console.error(error);
      onMessageSent('model', "连接失败。请检查 API Key 或网络环境。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      
      <div className="p-6 border-b border-slate-100 bg-white/70 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 transition-transform hover:rotate-0 cursor-pointer">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">学术辅助中心</h2>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Real-time Stream Active</p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
           <BookOpen size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 z-10 scroll-smooth overscroll-contain">
        {history.length === 0 && !streamingText && (
          <div className="text-center py-20 px-10 max-w-lg mx-auto">
            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-inner">
              <Sparkles size={40} className="text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">开启您的学术探索</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-10 font-medium">输入任何学术主题，我将为您提供逐字生成的实时深度解析。</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["社会存在决定社会意识", "数字化生产力分析", "逻辑漏洞检查"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="px-5 py-3 bg-white hover:bg-slate-900 hover:text-white text-slate-600 text-[11px] font-black rounded-2xl transition-all border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render committed history */}
        {history.map((msg, idx) => (
          <MessageItem key={idx} msg={msg} />
        ))}

        {/* Render current streaming message */}
        {streamingText && (
          <MessageItem 
            msg={{ 
              role: 'model', 
              text: streamingText, 
              timestamp: '', 
              unixTime: Date.now() 
            }} 
            isStreaming={true} 
          />
        )}

        {isLoading && !streamingText && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">AI 正在初始化深度逻辑...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-10">
        <div className="relative max-w-5xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的学术指令..."
            className="w-full pl-8 pr-20 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-bold shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2.5 top-2.5 p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-20 transition-all shadow-xl"
          >
            <Send size={22} />
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-300 mt-5 uppercase tracking-[0.4em] font-black">Verified Academic Audit Trace • Latency Optimized</p>
      </div>
    </div>
  );
};

export default AIAssistant;
