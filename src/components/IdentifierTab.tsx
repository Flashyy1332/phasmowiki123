import React, { useEffect, useMemo } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { EVIDENCES } from '../data';
import { Ghost } from '../types';
import { EVIDENCE_ICONS, SpeedClass, matchesSpeed, maxHuntThreshold } from '../lib/ghostMeta';
import { useStored } from '../lib/util';
import { GhostCard } from './GhostCard';
import type { AdminActions } from '../App';

type EvidenceState = 'yes' | 'no';

interface Journal {
  evidence: Record<string, EvidenceState>;
  speeds: SpeedClass[];
  sanity: number;
  ruledOut: string[];
}

const EMPTY: Journal = { evidence: {}, speeds: [], sanity: 0, ruledOut: [] };

const SPEEDS: { id: SpeedClass; label: string; hint: string }[] = [
  { id: 'slow', label: 'Повільний', hint: 'повільніший за звичайний крок' },
  { id: 'normal', label: 'Звичайний', hint: 'приблизно 1.7 м/с' },
  { id: 'fast', label: 'Швидкий', hint: 'швидший без прямої видимості' },
];

export function IdentifierTab({ ghosts, admin }: { ghosts: Ghost[]; admin: AdminActions | null }) {
  const [journal, setJournal] = useStored<Journal>('phasmo.journal', EMPTY);
  const yes = useMemo(() => EVIDENCES.filter((e) => journal.evidence[e] === 'yes'), [journal.evidence]);
  const no = useMemo(() => EVIDENCES.filter((e) => journal.evidence[e] === 'no'), [journal.evidence]);

  const fits = (g: Ghost, evYes = yes) =>
    evYes.every((e) => g.evidence.includes(e)) &&
    no.every((e) => !g.evidence.includes(e)) &&
    journal.speeds.every((s) => matchesSpeed(g, s)) &&
    (journal.sanity === 0 || (maxHuntThreshold(g) ?? 100) >= journal.sanity);

  const candidates = useMemo(() => ghosts.filter((g) => fits(g)), [ghosts, yes, no, journal.speeds, journal.sanity]);
  const suspects = candidates.filter((g) => !journal.ruledOut.includes(g.name));
  const crossed = candidates.filter((g) => journal.ruledOut.includes(g.name));
  const eliminated = ghosts.length - candidates.length;

  // Доказ «можливий», якщо з ним лишається хоча б один підозрюваний.
  const reachable = useMemo(() => {
    const set = new Set<string>();
    for (const e of EVIDENCES) {
      if (ghosts.some((g) => !journal.ruledOut.includes(g.name) && fits(g, yes.includes(e) ? yes : [...yes, e]))) set.add(e);
    }
    return set;
  }, [ghosts, yes, no, journal.speeds, journal.sanity, journal.ruledOut]);

  const cycle = (e: string) =>
    setJournal((j) => {
      const next = { ...j.evidence };
      if (next[e] === 'yes') next[e] = 'no';
      else if (next[e] === 'no') delete next[e];
      else next[e] = 'yes';
      return { ...j, evidence: next };
    });

  const toggleSpeed = (s: SpeedClass) =>
    setJournal((j) => ({ ...j, speeds: j.speeds.includes(s) ? j.speeds.filter((x) => x !== s) : [...j.speeds, s] }));

  const toggleRuleOut = (name: string) =>
    setJournal((j) => ({ ...j, ruledOut: j.ruledOut.includes(name) ? j.ruledOut.filter((n) => n !== name) : [...j.ruledOut, name] }));

  const reset = () => setJournal(EMPTY);
  const dirty = yes.length + no.length + journal.speeds.length + journal.ruledOut.length > 0 || journal.sanity > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
      const index = Number(e.key) - 1;
      if (index >= 0 && index < EVIDENCES.length) {
        const evidence = EVIDENCES[index];
        if (reachable.has(evidence) || journal.evidence[evidence]) cycle(evidence);
      } else if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'к') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const verdict =
    suspects.length === 1
      ? `Це ${suspects[0].name}`
      : suspects.length === 0
        ? 'Жоден привид не підходить'
        : `Підозрюваних: ${suspects.length}`;

  return (
    <div className="identifier">
      <aside className="journal" aria-label="Журнал доказів">
        <div className="journal-head">
          <h2>Журнал доказів</h2>
          <button className="btn btn-quiet" onClick={reset} disabled={!dirty}>
            <RotateCcw size={15} /> Скинути
          </button>
        </div>
        <p className="journal-help">
          Натисніть раз — доказ <b className="c-ok">знайдено</b>, двічі — <b className="c-no">виключено</b>, тричі — очистити.
        </p>

        <ul className="evidence-list">
          {EVIDENCES.map((e, i) => {
            const state = journal.evidence[e];
            const disabled = !state && !reachable.has(e);
            return (
              <li key={e}>
                <button className={`evidence ${state ? `is-${state}` : ''}`} disabled={disabled} onClick={() => cycle(e)} aria-pressed={state === 'yes'}>
                  <span className="evidence-box">{state === 'yes' ? <Check size={16} /> : state === 'no' ? <X size={16} /> : null}</span>
                  <span className="evidence-icon" aria-hidden="true">{EVIDENCE_ICONS[e]}</span>
                  <span className="evidence-name">{e}</span>
                  <kbd>{i + 1}</kbd>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="journal-block">
          <h3>Швидкість під час полювання</h3>
          <div className="chips">
            {SPEEDS.map((s) => (
              <button key={s.id} className={`chip ${journal.speeds.includes(s.id) ? 'is-on' : ''}`} onClick={() => toggleSpeed(s.id)} title={s.hint} aria-pressed={journal.speeds.includes(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="journal-hint">Позначте все, що бачили: привид міг бути і повільним, і швидким.</p>
        </div>

        <div className="journal-block">
          <h3>
            Глузд під час першого полювання
            <output>{journal.sanity === 0 ? 'не знаю' : `від ${journal.sanity}%`}</output>
          </h3>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={journal.sanity}
            onChange={(e) => setJournal((j) => ({ ...j, sanity: Number(e.target.value) }))}
            aria-label="Середній глузд команди під час першого полювання"
          />
          <p className="journal-hint">Якщо привид напав при високому глузді, пізні мисливці відпадають.</p>
        </div>
      </aside>

      <section className="results" aria-live="polite">
        <div className="results-head">
          <h1 className={suspects.length === 1 ? 'is-found' : suspects.length === 0 ? 'is-empty' : ''}>{verdict}</h1>
          <p className="muted">
            {suspects.length === 0
              ? 'Перевірте позначки — можливо, якийсь доказ виключено помилково.'
              : `Відсіяно ${eliminated + crossed.length} з ${ghosts.length}. Хрестик на картці викреслює привида вручну.`}
          </p>
        </div>

        <div className="ghost-grid">
          {suspects.map((g) => (
            <GhostCard key={g.name} ghost={g} matched={yes} admin={admin} onRuleOut={() => toggleRuleOut(g.name)} />
          ))}
        </div>

        {crossed.length > 0 && (
          <div className="crossed">
            <h3>Викреслено вручну</h3>
            <div className="chips">
              {crossed.map((g) => (
                <button key={g.name} className="chip is-struck" onClick={() => toggleRuleOut(g.name)} title="Повернути до підозрюваних">
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
