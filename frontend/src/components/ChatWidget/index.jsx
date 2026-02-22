// src/components/ChatWidget/index.jsx
import { useState } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome! How can I help you today?", sender: 'bot' }
  ]);

  const ORG_SLUG = "am"; 
  const API_BASE = "http://localhost:8000/api/v1";

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input;
    const userMsg = { id: Date.now(), text: userQuestion, sender: 'user' };
    
    // Create bot message immediately with a timestamp
    const botMsgId = Date.now() + 1;
    const startTime = performance.now();
    
    setMessages(prev => [...prev, userMsg, { 
      id: botMsgId, 
      text: '', 
      sender: 'bot', 
      startTime: startTime, 
      isStreaming: true 
    }]);
    
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/chat/ask?org_slug=${ORG_SLUG}&question=${encodeURIComponent(userQuestion)}`, 
        { method: 'POST' }
      );

      if (!response.ok) throw new Error("Connection failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.content) {
                accumulatedResponse += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === botMsgId 
                    ? { ...msg, text: accumulatedResponse } 
                    : msg
                ));
              }
            } catch (e) {}
          }
        }
      }

      // Mark streaming as finished to stop the timer
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: "Connection error.", isStreaming: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <ChatWindow 
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      )}
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
}