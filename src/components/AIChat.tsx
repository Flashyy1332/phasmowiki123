import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { User } from 'firebase/auth';
import { LogIn, Send, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { CloseButton } from './ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
}

const IDEAS = [
  'Зроби складність із множником x10, але щоб було реально вижити',
  'Як відрізнити Ханту від Мороя без доказів?',
  'Склади челендж на 0 доказів для трьох гравців',
  'Що робити, якщо привид напав у першу хвилину?',
];

const storageKey = (user: User) => `phasmo.chat.${user.uid}`;

export function AIChat({ open, onClose, user, onLogin }: { open: boolean; onClose: () => void; user: User | null; onLogin: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return setMessages([]);
    try {
      setMessages(JSON.parse(localStorage.getItem(storageKey(user)) || '[]'));
    } catch {
      setMessages([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(storageKey(user), JSON.stringify(messages.slice(-60)));
    } catch {
      /* сховище недоступне */
    }
  }, [messages, user]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.filter((m) => !m.failed).map(({ role, text }) => ({ role, text }));
    setMessages((list) => [...list, { id: `${Date.now()}u`, role: 'user', text: message }]);
    setInput('');
    setBusy(true);
    try {
      const data = await api<{ text: string }>('/api/chat', { method: 'POST', body: { message, previousMessages: history } });
      setMessages((list) => [...list, { id: `${Date.now()}a`, role: 'assistant', text: data.text }]);
    } catch (e: any) {
      setMessages((list) => [...list, { id: `${Date.now()}e`, role: 'assistant', text: e.message, failed: true }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="overlay overlay-side" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="chat" role="dialog" aria-label="ШІ-асистент">
        <header className="modal-bar">
          <h3>
            <Sparkles size={18} /> ШІ-асистент
          </h3>
          <div className="row-end">
            {user && messages.length > 0 && (
              <button className="icon-btn" onClick={() => setMessages([])} title="Очистити розмову" aria-label="Очистити розмову">
                <Trash2 size={17} />
              </button>
            )}
            <CloseButton onClick={onClose} />
          </div>
        </header>

        {!user ? (
          <div className="chat-gate">
            <Sparkles size={34} />
            <h3>Увійдіть, щоб поставити запитання</h3>
            <p className="muted">Асистент знає механіки гри і допоможе зібрати власну складність. Розмова зберігається лише у вашому браузері.</p>
            <button className="btn btn-uv" onClick={onLogin}>
              <LogIn size={16} /> Увійти через Google
            </button>
          </div>
        ) : (
          <>
            <div className="chat-log">
              {messages.length === 0 && (
                <div className="chat-intro">
                  <p>Запитайте про привидів, виживання або кастомну складність. Наприклад:</p>
                  {IDEAS.map((idea) => (
                    <button key={idea} className="chat-idea" onClick={() => send(idea)}>
                      {idea}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`bubble bubble-${m.role} ${m.failed ? 'is-failed' : ''}`}>
                  {m.role === 'assistant' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                </div>
              ))}
              {busy && (
                <div className="bubble bubble-assistant is-typing" aria-label="Асистент друкує">
                  <i /><i /><i />
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                maxLength={4000}
                placeholder="Ваше запитання…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button className="btn btn-uv" type="submit" disabled={busy || !input.trim()} aria-label="Надіслати">
                <Send size={17} />
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}
