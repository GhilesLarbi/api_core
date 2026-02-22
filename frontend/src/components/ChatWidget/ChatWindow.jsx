// src/components/ChatWidget/ChatWindow.jsx
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ResponseTimer = ({ startTime, isStreaming }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (isStreaming && startTime) {
      interval = setInterval(() => {
        setElapsed((performance.now() - startTime) / 1000);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isStreaming, startTime]);

  if (!startTime) return null;

  return (
    <div className="text-[10px] text-zinc-400 mt-1 ml-1 font-mono">
      {elapsed.toFixed(2)}s
    </div>
  );
};

export default function ChatWindow({ messages, input, setInput, onSend, isLoading, onClose }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="mb-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <h2 className="text-sm font-semibold text-zinc-900">Support AI</h2>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] text-[13.5px] leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-zinc-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm' 
                : 'text-zinc-700 bg-zinc-100/70 px-4 py-2.5 rounded-2xl rounded-tl-none'
            }`}>
              {msg.sender === 'bot' ? (
                msg.text ? (
                  <div className="markdown-container">
                    <ReactMarkdown 
                      components={{
                        // This handles the "stupid" formatting issues
                        p: ({children}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                        strong: ({children}) => <b className="font-bold text-zinc-900">{children}</b>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  // Only show dots if there is NO text yet
                  <div className="flex gap-1.5 py-1">
                    <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )
              ) : (
                msg.text
              )}
            </div>
            
            {msg.sender === 'bot' && msg.startTime && (
              <ResponseTimer 
                startTime={msg.startTime} 
                isStreaming={msg.isStreaming} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={onSend} className="p-4 bg-white border-t border-zinc-100 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-400"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          className="p-2 text-zinc-900 hover:bg-zinc-100 rounded-lg disabled:opacity-30 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}