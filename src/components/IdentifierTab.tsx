import React from 'react';
import { EVIDENCES } from '../data';
import { Ghost } from '../types';

interface Props {
  selectedEvidences: string[];
  excludedEvidences: string[];
  toggleEvidence: (evidence: string) => void;
  resetFilter: () => void;
  possibleGhosts: Ghost[];
  possibleEvidences: Set<string>;
}

export function IdentifierTab({
  selectedEvidences,
  excludedEvidences,
  toggleEvidence,
  resetFilter,
  possibleGhosts,
  possibleEvidences,
}: Props) {
  return (
    <section id="identifier" className="tab-content active">
      <div className="evidence-container">
        <div className="flex-between">
          <h2 style={{ border: 'none', margin: 0, padding: 0 }}>
            Фільтр Доказів
          </h2>
          <button className="reset-btn" onClick={resetFilter}>
            Скинути фільтри
          </button>
        </div>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            marginTop: '12px',
          }}
        >
          Клікніть: 1 раз —{' '}
          <span style={{ color: '#4ade80', fontWeight: 600 }}>Є доказ</span> | 2
          рази —{' '}
          <span style={{ color: '#f87171', fontWeight: 600 }}>
            Немає доказу
          </span>{' '}
          | 3 рази — Скинути стан.
        </p>
        <div className="evidence-grid">
          {EVIDENCES.map((evidence) => {
            const isSelected = selectedEvidences.includes(evidence);
            const isExcluded = excludedEvidences.includes(evidence);
            const isImpossible =
              !possibleEvidences.has(evidence) && possibleGhosts.length > 0;

            let btnClass = 'evidence-btn';
            if (isSelected) btnClass += ' selected';
            else if (isExcluded) btnClass += ' excluded';

            return (
              <button
                key={evidence}
                className={btnClass}
                disabled={isImpossible && !isSelected && !isExcluded}
                onClick={() => toggleEvidence(evidence)}
              >
                {evidence}
              </button>
            );
          })}
        </div>
      </div>

      <h2>
        Можливі привиди (<span>{possibleGhosts.length}</span>)
      </h2>
      <div className="grid-cards">
        {possibleGhosts.length === 0 ? (
          <p
            style={{
              color: '#f87171',
              gridColumn: '1/-1',
              padding: '20px',
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '12px',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Немає привидів з такою комбінацією доказів. Перевірте правильність!
          </p>
        ) : (
          possibleGhosts.map((ghost) => {
            return (
              <div key={ghost.name} className="card">
                <h3>
                  {ghost.name}
                  <span className="hunt-threshold">
                    Глузд для атаки: {ghost.hunt}
                  </span>
                </h3>
                <div className="ghost-tags">
                  {ghost.evidence.map((e) => {
                    const isMatch = selectedEvidences.includes(e);
                    const isFake =
                      ghost.name.includes('Мімік') && e === 'Примарний вогник';
                    let classes = [];
                    if (isMatch) classes.push('match');
                    if (isFake) classes.push('fake');
                    return (
                      <span key={e} className={classes.join(' ')}>
                        {e}
                        {isFake ? ' (Фейк)' : ''}
                      </span>
                    );
                  })}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div className="trait strength">
                    <strong>Сила:</strong> {ghost.strength}
                  </div>
                  <div className="trait weakness">
                    <strong>Слабкість:</strong> {ghost.weakness}
                  </div>
                </div>

                <details>
                  <summary>Як перевірити на 100%?</summary>
                  <div className="test-content">{ghost.test}</div>
                </details>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
