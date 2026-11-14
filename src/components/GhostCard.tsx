import React from 'react';
import { Footprints, Pencil, Trash2, Undo2, X } from 'lucide-react';
import { Ghost } from '../types';
import { FAKE_EVIDENCE, isMimic, maxHuntThreshold, speedOf } from '../lib/ghostMeta';
import type { AdminActions } from '../App';

/** Індикатор у стилі ЕМП-зчитувача: що більше діодів, то раніше привид починає полювання. */
export function ThresholdMeter({ ghost }: { ghost: Ghost }) {
  const max = maxHuntThreshold(ghost);
  const level = max === null ? 0 : max < 45 ? 1 : max <= 50 ? 2 : max <= 65 ? 3 : max <= 75 ? 4 : 5;
  return (
    <div className="meter" title="Глузд команди, за якого привид може почати полювання">
      <span className="meter-leds" data-level={level} aria-hidden="true">
        <i /><i /><i /><i /><i />
      </span>
      <span className="meter-text">Атакує з {ghost.hunt}</span>
    </div>
  );
}

interface Props {
  ghost: Ghost;
  matched?: string[];
  admin: AdminActions | null;
  ruledOut?: boolean;
  onRuleOut?: () => void;
  showDesc?: boolean;
}

export function GhostCard({ ghost, matched = [], admin, ruledOut, onRuleOut, showDesc }: Props) {
  const speed = speedOf(ghost);
  const speedLabel = speed.min === speed.max ? `${speed.min} м/с` : `${speed.min}–${speed.max} м/с`;
  return (
    <article className={`ghost ${ghost.isNew ? 'is-new' : ''} ${ruledOut ? 'is-out' : ''}`}>
      <header className="ghost-head">
        <h3>
          {ghost.name}
          {ghost.isNew && <span className="tag-new">новий</span>}
        </h3>
        {onRuleOut && (
          <button className="icon-btn" onClick={onRuleOut} title={ruledOut ? 'Повернути до підозрюваних' : 'Викреслити вручну'} aria-label={ruledOut ? 'Повернути' : 'Викреслити'}>
            {ruledOut ? <Undo2 size={17} /> : <X size={17} />}
          </button>
        )}
      </header>

      <ThresholdMeter ghost={ghost} />

      <ul className="evidence-tags">
        {ghost.evidence.map((e) => {
          const fake = isMimic(ghost) && e === FAKE_EVIDENCE;
          return (
            <li key={e} className={`${matched.includes(e) ? 'is-match' : ''} ${fake ? 'is-fake' : ''}`}>
              {e}
              {fake && ' (фейк)'}
            </li>
          );
        })}
      </ul>

      {!ruledOut && (
        <>
          {showDesc && ghost.desc && <p className="ghost-note">{ghost.desc}</p>}
          <dl className="traits">
            <div className="trait trait-strength">
              <dt>Сила</dt>
              <dd>{ghost.strength}</dd>
            </div>
            <div className="trait trait-weakness">
              <dt>Слабкість</dt>
              <dd>{ghost.weakness}</dd>
            </div>
          </dl>
          <p className="ghost-speed">
            <Footprints size={15} /> <b>{speedLabel}</b> <span>{speed.note}</span>
          </p>
          {ghost.test && (
            <details className="test">
              <summary>Як перевірити напевно</summary>
              <p>{ghost.test}</p>
            </details>
          )}
          {admin && (
            <div className="admin-row">
              <button className="btn btn-quiet" onClick={() => admin.editGhost(ghost)}>
                <Pencil size={15} /> Редагувати
              </button>
              <button className="btn btn-danger-quiet" onClick={() => admin.deleteGhost(ghost.name)}>
                <Trash2 size={15} /> Видалити
              </button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
