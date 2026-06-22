import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, User } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatTabProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isActive: boolean;
}

export function AIChatTab({ messages, setMessages, isActive }: AIChatTabProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isActive) {
      setTimeout(() => scrollToBottom(), 10);
    }
  }, [messages, isLoading, isActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg.text,
          previousMessages: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка сервера');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.text,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Вибачте, сталася помилка під час спроби отримати відповідь. Будь ласка, спробуйте ще раз.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-chat" className="tab-content active" style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '15px' }}>ШІ Асистент - Кастомна Складність</h2>
      
      <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: msg.role === 'assistant' ? 'var(--accent-purple)' : 'var(--state-selected-bg)',
                  color: msg.role === 'assistant' ? '#000' : 'var(--state-selected-text)',
                }}
              >
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              
              <div
                style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.05)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--card-border)' : 'rgba(56, 189, 248, 0.2)'}`,
                  color: 'var(--text-main)',
                  borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                  borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                }}
              >
                <div className="markdown-body" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--accent-purple)',
                  color: '#000',
                }}
              >
                <Bot size={20} />
              </div>
              <div style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                Друкує...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '15px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишіть, яку складність ви хочете..."
            style={{
              flexGrow: 1,
              padding: '12px 15px',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-title)',
              outline: 'none',
              fontSize: '0.95rem',
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="nav-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              padding: 0,
              backgroundColor: input.trim() && !isLoading ? 'var(--accent-purple)' : 'transparent',
              color: input.trim() && !isLoading ? '#000' : 'var(--text-muted)',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </section>
  );
}
