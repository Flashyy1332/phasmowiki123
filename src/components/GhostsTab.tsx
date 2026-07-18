import React from 'react';
import { Ghost } from '../types';

interface Props {
  ghosts: Ghost[];
  isAdmin: boolean;
  onEdit: (ghost: Ghost) => void;
  onDelete: (name: string) => void;
}

export function GhostsTab({ ghosts, isAdmin, onEdit, onDelete }: Props) {
  return (
    <section id="ghosts" className="tab-content active">
      <h2>Детальний довідник ({ghosts.length} привидів)</h2>
      <div className="grid-cards">
        {ghosts.map((ghost) => {
          return (
            <div key={ghost.name} className={`card ${ghost.isNew ? 'new-ghost' : ''}`}>
              <h3>
                {ghost.name}
                {ghost.isNew && <span className="new-badge">НОВИЙ</span>}
                <span className="hunt-threshold">
                  Глузд для атаки: {ghost.hunt}
                </span>
              </h3>
              <div className="ghost-tags">
                {ghost.evidence.map((e) => {
                  const isFake =
                    ghost.name.includes('Мімік') && e === 'Примарний вогник';
                  return (
                    <span key={e} className={isFake ? 'fake' : ''}>
                      {e}
                      {isFake ? ' (Фейк)' : ''}
                    </span>
                  );
                })}
              </div>
              <p
                style={{
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  marginBottom: '15px',
                  paddingLeft: '10px',
                  borderLeft: '2px solid var(--accent-purple)',
                  lineHeight: 1.5,
                }}
              >
                {ghost.desc}
              </p>

              <div style={{ flexGrow: 1 }}>
                <div className="trait strength">
                  <strong>Сила:</strong> {ghost.strength}
                </div>
                <div className="trait weakness">
                  <strong>Слабкість:</strong> {ghost.weakness}
                </div>
              </div>

              <details>
                <summary>Як перевірити (Тести)?</summary>
                <div className="test-content">{ghost.test}</div>
              </details>
              
              {isAdmin && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--card-border)' }}>
                  <button onClick={() => onEdit(ghost)} className="nav-btn" style={{ flex: 1, backgroundColor: 'var(--accent-purple)', color: '#000', fontSize: '0.9em', padding: '6px' }}>Редагувати</button>
                  <button onClick={() => onDelete(ghost.name)} className="nav-btn" style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', fontSize: '0.9em', padding: '6px' }}>Видалити</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
