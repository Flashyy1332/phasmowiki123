import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { User } from 'firebase/auth';
import { LogIn, Send, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useI18n, Key } from '../lib/i18n';
import { CloseButton } from './ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
}

const IDEAS: Key[] = ['chat.idea1', 'chat.idea2', 'chat.idea3', 'chat.idea4'];

const storageKey = (user: User) => `phasmo.chat.${user.uid}`;

export function AIChat({ open, onClose, user, onLogin }: { open: boolean; onClose: () => void; user: User | null; onLogin: () => void }) {
  const { t, lang } = useI18n();
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
      const data = await api<{ text: string }>('/api/chat', { method: 'POST', body: { message, previousMessages: history, lang } });
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
      <aside className="chat" role="dialog" aria-label={t('chat.title')}>
        <header className="modal-bar">
          <h3>
            <Sparkles size={18} /> {t('chat.title')}
          </h3>
          <div className="row-end">
            {user && messages.length > 0 && (
              <button className="icon-btn" onClick={() => setMessages([])} title={t('chat.clear')} aria-label={t('chat.clear')}>
                <Trash2 size={17} />
              </button>
            )}
            <CloseButton onClick={onClose} />
          </div>
        </header>

        {!user ? (
          <div className="chat-gate">
            <Sparkles size={34} />
            <h3>{t('chat.gateTitle')}</h3>
            <p className="muted">{t('chat.gateText')}</p>
            <button className="btn btn-uv" onClick={onLogin}>
              <LogIn size={16} /> {t('auth.loginGoogle')}
            </button>
          </div>
        ) : (
          <>
            <div className="chat-log">
              {messages.length === 0 && (
                <div className="chat-intro">
                  <p>{t('chat.intro')}</p>
                  {IDEAS.map((idea) => (
                    <button key={idea} className="chat-idea" onClick={() => send(t(idea))}>
                      {t(idea)}
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
                <div className="bubble bubble-assistant is-typing" aria-label={t('chat.typing')}>
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
                placeholder={t('chat.placeholder')}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button className="btn btn-uv" type="submit" disabled={busy || !input.trim()} aria-label={t('chat.send')}>
                <Send size={17} />
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}
