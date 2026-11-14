import React, { useEffect, useMemo } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { EVIDENCES } from '../data';
import { Ghost } from '../types';
import { EVIDENCE_ICONS, SpeedClass, matchesSpeed, maxHuntThreshold } from '../lib/ghostMeta';
import { useStored } from '../lib/util';
import { Key, useI18n } from '../lib/i18n';
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

const SPEEDS: { id: SpeedClass; label: Key; hint: Key }[] = [
  { id: 'slow', label: 'speed.slow', hint: 'speed.slow.hint' },
  { id: 'normal', label: 'speed.normal', hint: 'speed.normal.hint' },
  { id: 'fast', label: 'speed.fast', hint: 'speed.fast.hint' },
];

export function IdentifierTab({ ghosts, admin }: { ghosts: Ghost[]; admin: AdminActions | null }) {
  const { t, gName, ev } = useI18n();
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
      ? t('verdict.is', { name: gName(suspects[0]) })
      : suspects.length === 0
        ? t('verdict.none')
        : t('verdict.count', { n: suspects.length });

  return (
    <div className="identifier">
      <aside className="journal" aria-label={t('journal.title')}>
        <div className="journal-head">
          <h2>{t('journal.title')}</h2>
          <button className="btn btn-quiet" onClick={reset} disabled={!dirty}>
            <RotateCcw size={15} /> {t('common.reset')}
          </button>
        </div>
        <p className="journal-help" dangerouslySetInnerHTML={{ __html: t('journal.help') }} />

        <ul className="evidence-list">
          {EVIDENCES.map((e, i) => {
            const state = journal.evidence[e];
            const disabled = !state && !reachable.has(e);
            return (
              <li key={e}>
                <button className={`evidence ${state ? `is-${state}` : ''}`} disabled={disabled} onClick={() => cycle(e)} aria-pressed={state === 'yes'}>
                  <span className="evidence-box">{state === 'yes' ? <Check size={16} /> : state === 'no' ? <X size={16} /> : null}</span>
                  <span className="evidence-icon" aria-hidden="true">{EVIDENCE_ICONS[e]}</span>
                  <span className="evidence-name">{ev(e)}</span>
                  <kbd>{i + 1}</kbd>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="journal-block">
          <h3>{t('journal.speedTitle')}</h3>
          <div className="chips">
            {SPEEDS.map((s) => (
              <button key={s.id} className={`chip ${journal.speeds.includes(s.id) ? 'is-on' : ''}`} onClick={() => toggleSpeed(s.id)} title={t(s.hint)} aria-pressed={journal.speeds.includes(s.id)}>
                {t(s.label)}
              </button>
            ))}
          </div>
          <p className="journal-hint">{t('journal.speedHint')}</p>
        </div>

        <div className="journal-block">
          <h3>
            {t('journal.sanityTitle')}
            <output>{journal.sanity === 0 ? t('journal.sanityUnknown') : t('journal.sanityFrom', { n: journal.sanity })}</output>
          </h3>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={journal.sanity}
            onChange={(e) => setJournal((j) => ({ ...j, sanity: Number(e.target.value) }))}
            aria-label={t('journal.sanityAria')}
          />
          <p className="journal-hint">{t('journal.sanityHint')}</p>
        </div>
      </aside>

      <section className="results" aria-live="polite">
        <div className="results-head">
          <h1 className={suspects.length === 1 ? 'is-found' : suspects.length === 0 ? 'is-empty' : ''}>{verdict}</h1>
          <p className="muted">
            {suspects.length === 0
              ? t('results.checkMarks')
              : t('results.filtered', { n: eliminated + crossed.length, total: ghosts.length })}
          </p>
        </div>

        <div className="ghost-grid">
          {suspects.map((g) => (
            <GhostCard key={g.name} ghost={g} matched={yes} admin={admin} onRuleOut={() => toggleRuleOut(g.name)} />
          ))}
        </div>

        {crossed.length > 0 && (
          <div className="crossed">
            <h3>{t('crossed.title')}</h3>
            <div className="chips">
              {crossed.map((g) => (
                <button key={g.name} className="chip is-struck" onClick={() => toggleRuleOut(g.name)} title={t('crossed.restore')}>
                  {gName(g)}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
