import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Ghost } from '../types';
import { BASE_SPEED, bpmToSpeed, speedOf } from '../lib/ghostMeta';
import { beep } from '../lib/util';

/* ----------------------- Вимірювач темпу кроків ----------------------- */

function StepMeter({ ghosts }: { ghosts: Ghost[] }) {
  const [taps, setTaps] = useState<number[]>([]);

  const tap = () =>
    setTaps((list) => {
      const now = performance.now();
      const fresh = list.length && now - list[list.length - 1] > 2500 ? [] : list;
      return [...fresh, now].slice(-8);
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (/INPUT|TEXTAREA|SELECT|BUTTON/.test((e.target as HTMLElement).tagName)) return;
      e.preventDefault();
      tap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bpm = taps.length >= 3 ? Math.round(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1))) : null;
  const speed = bpm ? bpmToSpeed(bpm) : null;

  const matches = useMemo(() => {
    if (!speed) return [];
    return ghosts.filter((g) => {
      const s = speedOf(g);
      // Привиди зі стандартною швидкістю розганяються в полі зору до ×1.65.
      const max = s.min === s.max ? s.max * 1.65 : s.max;
      return speed >= s.min - 0.15 && speed <= max + 0.15;
    });
  }, [ghosts, speed]);

  const verdict = !speed ? '' : speed < BASE_SPEED - 0.2 ? 'повільніший за звичайного' : speed > BASE_SPEED + 0.2 ? 'швидший за звичайного' : 'звичайна швидкість';
  const fill = speed ? Math.min(100, (speed / 3.2) * 100) : 0;

  return (
    <section className="panel">
      <h2>Темп кроків</h2>
      <p className="muted">Стукайте в такт крокам привида — кнопкою або пробілом. Потрібно щонайменше три удари.</p>

      <div className="stepmeter">
        <button className="tap" onClick={tap}>
          <span className="tap-value">{speed ? speed.toFixed(2) : '—'}</span>
          <span className="tap-unit">м/с</span>
          <span className="tap-sub">{bpm ? `${bpm} кроків/хв` : 'стукайте тут'}</span>
        </button>

        <div className="stepmeter-side">
          <div className="gauge" aria-hidden="true">
            <div className="gauge-fill" style={{ width: `${fill}%` }} />
            <span className="gauge-mark" style={{ left: `${(BASE_SPEED / 3.2) * 100}%` }}>1.7</span>
          </div>
          {speed ? (
            <>
              <p className="stepmeter-verdict">{verdict}</p>
              <p className="muted">Підходять за швидкістю ({matches.length}):</p>
              <div className="chips">
                {matches.map((g) => (
                  <span key={g.name} className="chip is-static" title={speedOf(g).note}>
                    {g.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Шкала показує швидкість відносно звичайного привида (1.7 м/с). Значення приблизні.</p>
          )}
          <button className="btn btn-quiet" onClick={() => setTaps([])} disabled={!taps.length}>
            <RotateCcw size={15} /> Почати заново
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Таймери ------------------------------ */

interface Mark {
  at: number;
  label: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function MarkTimer({ title, text, marks, loop }: { title: string; text: string; marks: Mark[]; loop?: boolean }) {
  const total = marks[marks.length - 1].at;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(0);
  const fired = useRef(new Set<number>());

  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now() - elapsed * 1000;
    const id = window.setInterval(() => {
      let now = (performance.now() - startedAt.current) / 1000;
      for (const m of marks) {
        if (now >= m.at && !fired.current.has(m.at)) {
          fired.current.add(m.at);
          beep(m.at === total ? 3 : 2);
        }
      }
      if (now >= total) {
        if (loop) {
          startedAt.current = performance.now();
          fired.current.clear();
          now = 0;
        } else {
          setRunning(false);
          now = total;
        }
      }
      setElapsed(now);
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    fired.current.clear();
  };

  const next = marks.find((m) => elapsed < m.at);

  return (
    <div className={`timer ${running ? 'is-running' : ''}`}>
      <div className="timer-top">
        <div>
          <h3>{title}</h3>
          <p className="muted">{text}</p>
        </div>
        <div className="timer-clock">{fmt(elapsed)}</div>
      </div>

      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${(elapsed / total) * 100}%` }} />
        {marks.map((m) => (
          <span key={m.at} className={`timer-mark ${elapsed >= m.at ? 'is-passed' : ''}`} style={{ left: `${(m.at / total) * 100}%` }}>
            <i />
            <em>{m.label}</em>
          </span>
        ))}
      </div>

      <div className="timer-foot">
        <p>{next ? `Далі: ${next.label} через ${fmt(Math.ceil(next.at - elapsed))}` : 'Час вийшов'}</p>
        <div className="row-end">
          <button className="btn btn-quiet" onClick={reset} disabled={elapsed === 0}>
            <RotateCcw size={15} /> Скинути
          </button>
          <button
            className="btn btn-uv"
            onClick={() => {
              if (elapsed >= total) {
                setElapsed(0);
                fired.current.clear();
              }
              setRunning((r) => !r);
            }}
          >
            {running ? <Pause size={15} /> : <Play size={15} />} {running ? 'Пауза' : elapsed > 0 && elapsed < total ? 'Продовжити' : 'Запустити'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToolsTab({ ghosts }: { ghosts: Ghost[] }) {
  return (
    <div className="tools">
      <div className="page-head">
        <h1>Інструменти мисливця</h1>
        <p className="muted">Тримайте відкритими під час гри: таймери подають звуковий сигнал на кожній позначці.</p>
      </div>

      <StepMeter ghosts={ghosts} />

      <section className="panel">
        <h2>Таймери</h2>
        <div className="timers">
          <MarkTimer
            title="Після пахощів"
            text="Запустіть, коли обкурили привида. Якщо він нападе раніше за звичайну позначку — це Демон; якщо мовчить довше — Дух."
            marks={[
              { at: 60, label: 'Демон 1:00' },
              { at: 90, label: 'звичайні 1:30' },
              { at: 180, label: 'Дух 3:00' },
            ]}
          />
          <MarkTimer
            title="Перерва між полюваннями"
            text="Запустіть, коли полювання закінчилось. До позначки привид напасти не може."
            marks={[
              { at: 20, label: 'Демон 0:20' },
              { at: 25, label: 'інші 0:25' },
            ]}
          />
          <MarkTimer
            title="Цикл Обамбо"
            text="Обамбо змінює стан кожні дві хвилини. Таймер іде по колу — слухайте, чи збігається зміна швидкості із сигналом."
            marks={[{ at: 120, label: 'зміна стану 2:00' }]}
            loop
          />
        </div>
      </section>
    </div>
  );
}
