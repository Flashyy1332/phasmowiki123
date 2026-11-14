import React from 'react';
import { Footprints, Pencil, Trash2, Undo2, X } from 'lucide-react';
import { Ghost } from '../types';
import { FAKE_EVIDENCE, isMimic, maxHuntThreshold, speedOf } from '../lib/ghostMeta';
import { useI18n } from '../lib/i18n';
import type { AdminActions } from '../App';

/** Індикатор у стилі ЕМП-зчитувача: що більше діодів, то раніше привид починає полювання. */
export function ThresholdMeter({ ghost }: { ghost: Ghost }) {
  const { t, gField } = useI18n();
  const max = maxHuntThreshold(ghost);
  const level = max === null ? 0 : max < 45 ? 1 : max <= 50 ? 2 : max <= 65 ? 3 : max <= 75 ? 4 : 5;
  return (
    <div className="meter" title={t('meter.title')}>
      <span className="meter-leds" data-level={level} aria-hidden="true">
        <i /><i /><i /><i /><i />
      </span>
      <span className="meter-text">{t('meter.attacks', { hunt: gField(ghost, 'hunt') })}</span>
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
  const { t, lang, gName, gField, ev } = useI18n();
  const speed = speedOf(ghost, lang);
  const unit = t('unit.ms');
  const speedLabel = speed.min === speed.max ? `${speed.min} ${unit}` : `${speed.min}–${speed.max} ${unit}`;
  const desc = gField(ghost, 'desc');
  const test = gField(ghost, 'test');
  return (
    <article className={`ghost ${ghost.isNew ? 'is-new' : ''} ${ruledOut ? 'is-out' : ''}`}>
      <header className="ghost-head">
        <h3>
          {gName(ghost)}
          {ghost.isNew && <span className="tag-new">{t('ghost.new')}</span>}
        </h3>
        {onRuleOut && (
          <button
            className="icon-btn"
            onClick={onRuleOut}
            title={ruledOut ? t('crossed.restore') : t('ghost.ruleOut')}
            aria-label={ruledOut ? t('ghost.restoreShort') : t('ghost.ruleOutShort')}
          >
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
              {ev(e)}
              {fake && ` ${t('ghost.fake')}`}
            </li>
          );
        })}
      </ul>

      {!ruledOut && (
        <>
          {showDesc && desc && <p className="ghost-note">{desc}</p>}
          <dl className="traits">
            <div className="trait trait-strength">
              <dt>{t('ghost.strength')}</dt>
              <dd>{gField(ghost, 'strength')}</dd>
            </div>
            <div className="trait trait-weakness">
              <dt>{t('ghost.weakness')}</dt>
              <dd>{gField(ghost, 'weakness')}</dd>
            </div>
          </dl>
          <p className="ghost-speed">
            <Footprints size={15} /> <b>{speedLabel}</b> <span>{speed.note}</span>
          </p>
          {test && (
            <details className="test">
              <summary>{t('ghost.test')}</summary>
              <p>{test}</p>
            </details>
          )}
          {admin && (
            <div className="admin-row">
              <button className="btn btn-quiet" onClick={() => admin.editGhost(ghost)}>
                <Pencil size={15} /> {t('common.edit')}
              </button>
              <button className="btn btn-danger-quiet" onClick={() => admin.deleteGhost(ghost.name)}>
                <Trash2 size={15} /> {t('common.delete')}
              </button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
