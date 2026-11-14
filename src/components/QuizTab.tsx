import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { Ghost } from '../types';
import { FAKE_EVIDENCE, isMimic } from '../lib/ghostMeta';
import { useStored } from '../lib/util';

type Mode = 'evidence' | 'weakness' | 'test';

const MODES: { id: Mode; label: string; prompt: string }[] = [
  { id: 'evidence', label: 'За доказами', prompt: 'У якого привида такі докази?' },
  { id: 'weakness', label: 'За слабкістю', prompt: 'Чия це слабкість?' },
  { id: 'test', label: 'За тестом', prompt: 'Кого так перевіряють?' },
];

interface Question {
  answer: Ghost;
  options: Ghost[];
}

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

/** Прибирає з підказки назву привида, щоб відповідь не читалася з тексту. */
function hideName(text: string, ghost: Ghost) {
  const words = ghost.name.replace(/[()]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
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
            <li key={e} className={isMimic(g) && e === FAKE_EVIDENCE ? 'is-fake' : ''}>{e}</li>
          ))}
        </ul>
      );
    }
    return <blockquote className="quiz-quote">{hideName(mode === 'weakness' ? g.weakness : g.test, g)}</blockquote>;
  }, [question, mode]);

  if (!playable || !question) {
    return (
      <div className="empty">
        <h2>Замало привидів для тренування</h2>
        <p>Потрібно щонайменше чотири записи в довіднику.</p>
      </div>
    );
  }

  const right = picked === question.answer.name;

  return (
    <div className="quiz">
      <div className="page-head">
        <h1>Тренування</h1>
        <p className="muted">Перевірте, чи впізнаєте привида без журналу. Відповідати можна клавішами 1–4.</p>
      </div>

      <div className="quiz-bar">
        <div className="chips">
          {MODES.map((m) => (
            <button key={m.id} className={`chip ${mode === m.id ? 'is-on' : ''}`} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="quiz-score">
          <span><Flame size={16} /> Серія <b>{streak}</b></span>
          <span>Рекорд <b>{best}</b></span>
          <span>Правильно <b>{stats.right}/{stats.total}</b></span>
        </div>
      </div>

      <section className="panel quiz-card">
        <h2>{MODES.find((m) => m.id === mode)!.prompt}</h2>
        {clue}

        <div className="quiz-options">
          {question.options.map((g, i) => {
            const state = !picked ? '' : g.name === question.answer.name ? 'is-right' : g.name === picked ? 'is-wrong' : 'is-dim';
            return (
              <button key={g.name} className={`quiz-option ${state}`} onClick={() => choose(g.name)} disabled={!!picked}>
                <kbd>{i + 1}</kbd>
                {g.name}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className={`quiz-result ${right ? 'is-right' : 'is-wrong'}`}>
            <div>
              <b>{right ? 'Правильно.' : `Ні, це ${question.answer.name}.`}</b>
              <p>{question.answer.desc || question.answer.strength}</p>
            </div>
            <button className="btn btn-uv" onClick={next} autoFocus>
              Наступне <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
