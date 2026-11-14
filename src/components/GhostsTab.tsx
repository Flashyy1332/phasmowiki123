import React, { useMemo, useState } from 'react';
import { EVIDENCES } from '../data';
import { Ghost } from '../types';
import { maxHuntThreshold, speedOf } from '../lib/ghostMeta';
import { useI18n } from '../lib/i18n';
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
  const { t, lang, gName, gField, ev } = useI18n();
  const [evidence, setEvidence] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('name');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = ghosts.filter(
      (g) =>
        evidence.every((e) => g.evidence.includes(e)) &&
        (!needle || [g.name, gName(g), gField(g, 'desc'), gField(g, 'strength'), gField(g, 'weakness'), gField(g, 'test')].some((text) => text.toLowerCase().includes(needle))),
    );
    if (sort === 'hunt') return [...list].sort((a, b) => (maxHuntThreshold(b) ?? -1) - (maxHuntThreshold(a) ?? -1));
    if (sort === 'speed') return [...list].sort((a, b) => speedOf(b).max - speedOf(a).max);
    return list;
  }, [ghosts, query, evidence, sort, lang]);

  const toggle = (e: string) => setEvidence((list) => (list.includes(e) ? list.filter((x) => x !== e) : [...list, e]));

  return (
    <section>
      <div className="page-head">
        <h1>{t('ghosts.title')}</h1>
        <p className="muted">
          {shown.length === ghosts.length ? t('ghosts.all', { n: ghosts.length }) : t('ghosts.found', { n: shown.length, total: ghosts.length })}
        </p>
      </div>

      <div className="toolbar">
        <SearchField value={query} onChange={setQuery} placeholder={t('ghosts.searchPh')} />
        <label className="field-select">
          {t('sort.label')}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="name">{t('sort.name')}</option>
            <option value="hunt">{t('sort.hunt')}</option>
            <option value="speed">{t('sort.speed')}</option>
          </select>
        </label>
      </div>
      <div className="chips toolbar-chips">
        {EVIDENCES.map((e) => (
          <button key={e} className={`chip ${evidence.includes(e) ? 'is-on' : ''}`} onClick={() => toggle(e)} aria-pressed={evidence.includes(e)}>
            {ev(e)}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>{t('ghosts.emptyTitle')}</h2>
          <p>{t('ghosts.emptyText')}</p>
          <button
            className="btn btn-quiet"
            onClick={() => {
              setQuery('');
              setEvidence([]);
            }}
          >
            {t('ghosts.clearFilters')}
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
