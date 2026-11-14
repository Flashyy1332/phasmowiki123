import React, { useMemo } from 'react';
import { Ghost } from '../types';
import { huntThresholds } from '../lib/ghostMeta';
import { MECHANICS } from '../lib/content';
import { useI18n } from '../lib/i18n';

export function MechanicsTab({ ghosts }: { ghosts: Ghost[] }) {
  const { lang, gName, gField } = useI18n();
  const content = MECHANICS[lang];
  const rows = useMemo(
    () =>
      ghosts
        .map((g) => ({ ghost: g, values: huntThresholds(g) }))
        .filter((r) => r.values.length && (r.values.length > 1 || r.values[0] !== 50))
        .sort((a, b) => Math.max(...b.values) - Math.max(...a.values)),
    [ghosts],
  );
  const standard = ghosts.length - rows.length;

  return (
    <div className="mechanics">
      <div className="page-head">
        <h1>{content.title}</h1>
        <p className="muted">{content.sub}</p>
      </div>

      <section className="panel">
        <h2>{content.huntTitle}</h2>
        <p className="lead">{content.huntLead}</p>
        <div className="sanity-chart">
          <div className="sanity-axis" aria-hidden="true">
            <span style={{ left: '0%' }}>0%</span>
            <span style={{ left: '50%' }}>50%</span>
            <span style={{ left: '100%' }}>100%</span>
          </div>
          {rows.map(({ ghost, values }) => {
            const lo = Math.min(...values);
            const hi = Math.max(...values);
            return (
              <div key={ghost.name} className="sanity-row">
                <span className="sanity-name">{gName(ghost)}</span>
                <span className="sanity-track">
                  <i className="sanity-base" />
                  <i className="sanity-bar" style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 0)}%` }} />
                  {values.map((v, i) => (
                    <i key={i} className="sanity-dot" style={{ left: `${v}%` }} />
                  ))}
                </span>
                <span className="sanity-text">{gField(ghost, 'hunt')}</span>
              </div>
            );
          })}
        </div>
        <p className="muted">{content.standardLeft(standard)}</p>
      </section>

      <div className="columns">
        {content.panels.map((panel) => (
          <section key={panel.title} className="panel">
            <h2>{panel.title}</h2>
            {panel.lead && <p className="lead">{panel.lead}</p>}
            <dl className="facts">
              {panel.facts.map(([term, text]) => (
                <React.Fragment key={term}>
                  <dt>{term}</dt>
                  <dd>{text}</dd>
                </React.Fragment>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="panel">
        <h2>{content.cursedTitle}</h2>
        <p className="lead">{content.cursedLead}</p>
        <div className="cursed">
          {content.cursed.map((c) => (
            <div key={c.name} className="cursed-item">
              <span aria-hidden="true">{c.icon}</span>
              <div>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
