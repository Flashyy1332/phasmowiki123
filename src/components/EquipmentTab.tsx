import React, { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Equipment } from '../types';
import { sanitizeHtml, stripHtml } from '../lib/util';
import { useI18n } from '../lib/i18n';
import { CloseButton, Modal, SearchField } from './ui';
import type { AdminActions } from '../App';

interface Props {
  equipment: Equipment[];
  admin: AdminActions | null;
  query: string;
  setQuery: (q: string) => void;
}

function Photo({ item, onOpen }: { item: Equipment; onOpen: () => void }) {
  const { t, eName } = useI18n();
  const [failed, setFailed] = useState(false);
  if (!item.image || failed) {
    return (
      <div className="gear-photo gear-photo-empty" aria-hidden="true">
        {item.icon || '📦'}
      </div>
    );
  }
  return (
    <button className="gear-photo" onClick={onOpen} aria-label={t('gear.zoomAria', { name: eName(item) })}>
      <img src={item.image} alt={eName(item)} loading="lazy" onError={() => setFailed(true)} />
    </button>
  );
}

export function EquipmentTab({ equipment, admin, query, setQuery }: Props) {
  const { t, lang, eName, eDesc } = useI18n();
  const [zoom, setZoom] = useState<Equipment | null>(null);
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? equipment.filter((e) => `${e.name} ${eName(e)} ${stripHtml(eDesc(e))}`.toLowerCase().includes(needle)) : equipment;
  }, [equipment, query, lang]);

  return (
    <section>
      <div className="page-head">
        <h1>{t('tab.equipment')}</h1>
        <p className="muted">{t('gear.sub')}</p>
      </div>

      <div className="tiers">
        <div><b>{t('gear.tier1')}</b>{t('gear.tier1Text')}</div>
        <div><b>{t('gear.tier2')}</b>{t('gear.tier2Text')}</div>
        <div><b>{t('gear.tier3')}</b>{t('gear.tier3Text')}</div>
      </div>

      <div className="toolbar">
        <SearchField value={query} onChange={setQuery} placeholder={t('gear.searchPh')} />
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>{t('gear.emptyTitle')}</h2>
          <button className="btn btn-quiet" onClick={() => setQuery('')}>{t('gear.showAll')}</button>
        </div>
      ) : (
        <div className="gear-grid">
          {shown.map((item) => (
            <article key={item.name} className="gear">
              <Photo item={item} onOpen={() => setZoom(item)} />
              <div className="gear-body">
                <h3>
                  <span aria-hidden="true">{item.icon}</span> {eName(item)}
                </h3>
                <div className="gear-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(eDesc(item)) }} />
                {admin && (
                  <div className="admin-row">
                    <button className="btn btn-quiet" onClick={() => admin.editEquipment(item)}>
                      <Pencil size={15} /> {t('common.edit')}
                    </button>
                    <button className="btn btn-danger-quiet" onClick={() => admin.deleteEquipment(item.name)}>
                      <Trash2 size={15} /> {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!zoom} onClose={() => setZoom(null)} label={zoom ? eName(zoom) : ''} className="modal-photo">
        {zoom && (
          <>
            <div className="modal-bar">
              <h3>{eName(zoom)}</h3>
              <CloseButton onClick={() => setZoom(null)} />
            </div>
            <img src={zoom.image} alt={eName(zoom)} />
          </>
        )}
      </Modal>
    </section>
  );
}
