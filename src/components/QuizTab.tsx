import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { Ghost } from '../types';
import { FAKE_EVIDENCE, isMimic } from '../lib/ghostMeta';
import { useStored } from '../lib/util';
import { Key, useI18n } from '../lib/i18n';

type Mode = 'evidence' | 'weakness' | 'test';

const MODES: { id: Mode; label: Key; prompt: Key }[] = [
  { id: 'evidence', label: 'quiz.mode.evidence', prompt: 'quiz.prompt.evidence' },
  { id: 'weakness', label: 'quiz.mode.weakness', prompt: 'quiz.prompt.weakness' },
  { id: 'test', label: 'quiz.mode.test', prompt: 'quiz.prompt.test' },
];

interface Question {
  answer: Ghost;
  options: Ghost[];
}

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

/** Прибирає з підказки назву привида (в обох мовах), щоб відповідь не читалася з тексту. */
function hideName(text: string, ghost: Ghost) {
  const STOP = new Set(['the']);
  const words = ghost.name.replace(/[()]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()));
  let out = text;
  for (const w of words) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, Math.max(3, w.length - 1)) + '[а-яіїєґa-z]*', 'gi'), '███');
  return out;
}

function makeQuestion(ghosts: Ghost[], previous?: string): Question {
  const pool = ghosts.filter((g) => g.name !== previous);
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const options = shuffle([answer, ...shuffle(ghosts.filter((g) => g.name !== answer.name)).slice(0, 3)]);
  return { answer, options };
}

export function QuizTab({ ghosts }: { ghosts: Ghost[] }) {
  const { t, lang, gName, gField, ev } = useI18n();
  const [mode, setMode] = useState<Mode>('evidence');
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useStored<number>('phasmo.quiz.best', 0);
  const [stats, setStats] = useState({ right: 0, total: 0 });

  const playable = ghosts.length >= 4;
  const next = () => {
    setPicked(null);
    setQuestion((q) => makeQuestion(ghosts, q?.answer.name));
  };

  useEffect(() => {
    if (playable) next();
  }, [mode, ghosts.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      const i = Number(e.key) - 1;
      if (!picked && i >= 0 && i < question.options.length) choose(question.options[i].name);
      else if (picked && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const choose = (name: string) => {
    if (!question || picked) return;
    setPicked(name);
    const right = name === question.answer.name;
    setStats((s) => ({ right: s.right + Number(right), total: s.total + 1 }));
    const nextStreak = right ? streak + 1 : 0;
    setStreak(nextStreak);
    if (nextStreak > best) setBest(nextStreak);
  };

  const clue = useMemo(() => {
    if (!question) return null;
    const g = question.answer;
    if (mode === 'evidence') {
      return (
        <ul className="evidence-tags quiz-evidence">
          {g.evidence.map((e) => (
            <li key={e} className={isMimic(g) && e === FAKE_EVIDENCE ? 'is-fake' : ''}>{ev(e)}</li>
          ))}
        </ul>
      );
    }
    return <blockquote className="quiz-quote">{hideName(gField(g, mode === 'weakness' ? 'weakness' : 'test'), g)}</blockquote>;
  }, [question, mode, lang]);

  if (!playable || !question) {
    return (
      <div className="empty">
        <h2>{t('quiz.tooFewTitle')}</h2>
        <p>{t('quiz.tooFewText')}</p>
      </div>
    );
  }

  const right = picked === question.answer.name;

  return (
    <div className="quiz">
      <div className="page-head">
        <h1>{t('quiz.title')}</h1>
        <p className="muted">{t('quiz.sub')}</p>
      </div>

      <div className="quiz-bar">
        <div className="chips">
          {MODES.map((m) => (
            <button key={m.id} className={`chip ${mode === m.id ? 'is-on' : ''}`} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}>
              {t(m.label)}
            </button>
          ))}
        </div>
        <div className="quiz-score">
          <span><Flame size={16} /> {t('quiz.streak')} <b>{streak}</b></span>
          <span>{t('quiz.best')} <b>{best}</b></span>
          <span>{t('quiz.correct')} <b>{stats.right}/{stats.total}</b></span>
        </div>
      </div>

      <section className="panel quiz-card">
        <h2>{t(MODES.find((m) => m.id === mode)!.prompt)}</h2>
        {clue}

        <div className="quiz-options">
          {question.options.map((g, i) => {
            const state = !picked ? '' : g.name === question.answer.name ? 'is-right' : g.name === picked ? 'is-wrong' : 'is-dim';
            return (
              <button key={g.name} className={`quiz-option ${state}`} onClick={() => choose(g.name)} disabled={!!picked}>
                <kbd>{i + 1}</kbd>
                {gName(g)}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className={`quiz-result ${right ? 'is-right' : 'is-wrong'}`}>
            <div>
              <b>{right ? t('quiz.right') : t('quiz.wrong', { name: gName(question.answer) })}</b>
              <p>{gField(question.answer, 'desc') || gField(question.answer, 'strength')}</p>
            </div>
            <button className="btn btn-uv" onClick={next} autoFocus>
              {t('quiz.next')} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
