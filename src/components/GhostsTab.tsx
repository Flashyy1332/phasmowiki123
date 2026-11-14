import React, { useMemo, useState } from 'react';
import { EVIDENCES } from '../data';
import { Ghost } from '../types';
import { maxHuntThreshold, speedOf } from '../lib/ghostMeta';
import { GhostCard } from './GhostCard';
import { SearchField } from './ui';
import type { AdminActions } from '../App';

type Sort = 'name' | 'hunt' | 'speed';

interface Props {
  ghosts: Ghost[];
  admin: AdminActions | null;
  query: string;
  setQuery: (q: string) => void;
}

export function GhostsTab({ ghosts, admin, query, setQuery }: Props) {
  const [evidence, setEvidence] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('name');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = ghosts.filter(
      (g) =>
        evidence.every((e) => g.evidence.includes(e)) &&
        (!needle || [g.name, g.desc, g.strength, g.weakness, g.test].some((t) => t.toLowerCase().includes(needle))),
    );
    if (sort === 'hunt') return [...list].sort((a, b) => (maxHuntThreshold(b) ?? -1) - (maxHuntThreshold(a) ?? -1));
    if (sort === 'speed') return [...list].sort((a, b) => speedOf(b).max - speedOf(a).max);
    return list;
  }, [ghosts, query, evidence, sort]);

  const toggle = (e: string) => setEvidence((list) => (list.includes(e) ? list.filter((x) => x !== e) : [...list, e]));

  return (
    <section>
      <div className="page-head">
        <h1>Довідник привидів</h1>
        <p className="muted">
          {shown.length === ghosts.length ? `Усі ${ghosts.length} привидів гри` : `Знайдено ${shown.length} з ${ghosts.length}`}
        </p>
      </div>

      <div className="toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="Назва, сила, слабкість…" />
        <label className="field-select">
          Сортувати
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="name">за назвою</option>
            <option value="hunt">за порогом атаки</option>
            <option value="speed">за швидкістю</option>
          </select>
        </label>
      </div>
      <div className="chips toolbar-chips">
        {EVIDENCES.map((e) => (
          <button key={e} className={`chip ${evidence.includes(e) ? 'is-on' : ''}`} onClick={() => toggle(e)} aria-pressed={evidence.includes(e)}>
            {e}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>Нічого не знайдено</h2>
          <p>Спробуйте інший запит або зніміть фільтр доказів.</p>
          <button
            className="btn btn-quiet"
            onClick={() => {
              setQuery('');
              setEvidence([]);
            }}
          >
            Очистити фільтри
          </button>
        </div>
      ) : (
        <div className="ghost-grid">
          {shown.map((g) => (
            <GhostCard key={g.name} ghost={g} matched={evidence} admin={admin} showDesc />
          ))}
        </div>
      )}
    </section>
  );
}
