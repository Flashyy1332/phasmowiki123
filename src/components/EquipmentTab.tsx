import React, { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Equipment } from '../types';
import { sanitizeHtml, stripHtml } from '../lib/util';
import { CloseButton, Modal, SearchField } from './ui';
import type { AdminActions } from '../App';

interface Props {
  equipment: Equipment[];
  admin: AdminActions | null;
  query: string;
  setQuery: (q: string) => void;
}

function Photo({ item, onOpen }: { item: Equipment; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);
  if (!item.image || failed) {
    return (
      <div className="gear-photo gear-photo-empty" aria-hidden="true">
        {item.icon || '📦'}
      </div>
    );
  }
  return (
    <button className="gear-photo" onClick={onOpen} aria-label={`Збільшити фото: ${item.name}`}>
      <img src={item.image} alt={item.name} loading="lazy" onError={() => setFailed(true)} />
    </button>
  );
}

export function EquipmentTab({ equipment, admin, query, setQuery }: Props) {
  const [zoom, setZoom] = useState<Equipment | null>(null);
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? equipment.filter((e) => `${e.name} ${stripHtml(e.desc)}`.toLowerCase().includes(needle)) : equipment;
  }, [equipment, query]);

  return (
    <section>
      <div className="page-head">
        <h1>Спорядження</h1>
        <p className="muted">На фото — предмети третього рівня. Натисніть на фото, щоб збільшити.</p>
      </div>

      <div className="tiers">
        <div><b>1 рівень</b>Старе аналогове обладнання: повільне, з малим радіусом дії.</div>
        <div><b>2 рівень</b>Сучасне стандартне спорядження: надійне і зручне.</div>
        <div><b>3 рівень</b>Найкращі прилади: миттєві, з великим радіусом і додатковими функціями.</div>
      </div>

      <div className="toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="Назва або опис предмета…" />
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>Такого предмета немає</h2>
          <button className="btn btn-quiet" onClick={() => setQuery('')}>Показати все спорядження</button>
        </div>
      ) : (
        <div className="gear-grid">
          {shown.map((item) => (
            <article key={item.name} className="gear">
              <Photo item={item} onOpen={() => setZoom(item)} />
              <div className="gear-body">
                <h3>
                  <span aria-hidden="true">{item.icon}</span> {item.name}
                </h3>
                <div className="gear-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc) }} />
                {admin && (
                  <div className="admin-row">
                    <button className="btn btn-quiet" onClick={() => admin.editEquipment(item)}>
                      <Pencil size={15} /> Редагувати
                    </button>
                    <button className="btn btn-danger-quiet" onClick={() => admin.deleteEquipment(item.name)}>
                      <Trash2 size={15} /> Видалити
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!zoom} onClose={() => setZoom(null)} label={zoom?.name || ''} className="modal-photo">
        {zoom && (
          <>
            <div className="modal-bar">
              <h3>{zoom.name}</h3>
              <CloseButton onClick={() => setZoom(null)} />
            </div>
            <img src={zoom.image} alt={zoom.name} />
          </>
        )}
      </Modal>
    </section>
  );
}
