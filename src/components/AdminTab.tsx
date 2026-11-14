import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, DatabaseZap, RefreshCw, TriangleAlert } from 'lucide-react';
import { EVIDENCES } from '../data';
import { Ghost, Equipment } from '../types';
import { api, LOCAL_EQUIPMENT, LOCAL_GHOSTS, WikiData } from '../lib/api';
import { sanitizeHtml } from '../lib/util';
import { GhostCard } from './GhostCard';
import { useToast } from './ui';

interface Health {
  db: { configured: boolean; canWrite: boolean; ok: boolean; ghosts?: number; equipment?: number; code?: string; message?: string };
  ai: { configured: boolean; model: string };
}

interface Props {
  data: WikiData;
  editingGhost: Ghost | null;
  setEditingGhost: (g: Ghost | null) => void;
  editingEquipment: Equipment | null;
  setEditingEquipment: (e: Equipment | null) => void;
  onRefresh: () => Promise<unknown>;
}

const EMPTY_GHOST: Ghost = { name: '', isNew: false, hunt: '', evidence: [], desc: '', strength: '', weakness: '', test: '' };
const EMPTY_EQUIPMENT: Equipment = { name: '', icon: '', image: '', desc: '' };

const toApiGhost = (g: Ghost) => ({ name: g.name, isNew: !!g.isNew, huntThreshold: g.hunt, evidences: g.evidence, description: g.desc, strength: g.strength, weakness: g.weakness, testToVerify: g.test });
const toApiEquipment = (e: Equipment) => ({ name: e.name, icon: e.icon, imageName: e.image.replace(/^\/items\//, ''), description: e.desc });

export function AdminTab({ data, editingGhost, setEditingGhost, editingEquipment, setEditingEquipment, onRefresh }: Props) {
  const toast = useToast();
  const [section, setSection] = useState<'ghost' | 'equipment'>('ghost');
  const [ghost, setGhost] = useState<Ghost>(EMPTY_GHOST);
  const [item, setItem] = useState<Equipment>(EMPTY_EQUIPMENT);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [checking, setChecking] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const checkHealth = async () => {
    setChecking(true);
    try {
      setHealth(await api<Health>('/api/health'));
    } catch (e: any) {
      setHealth({ db: { configured: false, canWrite: false, ok: false, message: e.message }, ai: { configured: false, model: '' } });
    }
    setChecking(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (editingGhost) {
      setSection('ghost');
      setGhost(editingGhost);
    }
  }, [editingGhost]);

  useEffect(() => {
    if (editingEquipment) {
      setSection('equipment');
      setItem(editingEquipment);
    }
  }, [editingEquipment]);

  const resetGhost = () => {
    setEditingGhost(null);
    setGhost(EMPTY_GHOST);
  };
  const resetItem = () => {
    setEditingEquipment(null);
    setItem(EMPTY_EQUIPMENT);
  };

  const saveGhost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ghost.evidence.length < 3) return toast('Позначте щонайменше три докази.', 'error');
    setSaving(true);
    try {
      await api(editingGhost ? `/api/ghosts/${encodeURIComponent(editingGhost.name)}` : '/api/ghosts', { method: editingGhost ? 'PUT' : 'POST', body: { ghost: toApiGhost(ghost) } });
      toast(editingGhost ? `Збережено: ${ghost.name}` : `Додано: ${ghost.name}`);
      resetGhost();
      await onRefresh();
    } catch (err: any) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api(editingEquipment ? `/api/equipment/${encodeURIComponent(editingEquipment.name)}` : '/api/equipment', { method: editingEquipment ? 'PUT' : 'POST', body: { equipment: toApiEquipment(item) } });
      toast(editingEquipment ? `Збережено: ${item.name}` : `Додано: ${item.name}`);
      resetItem();
      await onRefresh();
    } catch (err: any) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };

  const importLocal = async () => {
    setSaving(true);
    try {
      const result = await api<{ ghosts: number; equipment: number }>('/api/admin/import', {
        method: 'POST',
        body: { ghosts: LOCAL_GHOSTS.map(toApiGhost), equipment: LOCAL_EQUIPMENT.map(toApiEquipment) },
      });
      toast(`Додано в базу: привидів ${result.ghosts}, предметів ${result.equipment}`);
      await Promise.all([onRefresh(), checkHealth()]);
    } catch (err: any) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };

  const wrap = (before: string, after: string) => {
    const el = descRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    setItem((it) => ({ ...it, desc: it.desc.slice(0, s) + before + it.desc.slice(s, e) + after + it.desc.slice(e) }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, e + before.length);
    });
  };

  const toggleEvidence = (e: string) =>
    setGhost((g) => ({ ...g, evidence: g.evidence.includes(e) ? g.evidence.filter((x) => x !== e) : [...g.evidence, e] }));

  const db = health?.db;

  return (
    <div className="admin">
      <div className="page-head">
        <h1>Адмін-панель</h1>
        <p className="muted">Зміни одразу потрапляють у базу і стають видимими всім відвідувачам.</p>
      </div>

      <section className={`panel health ${db?.ok ? 'is-ok' : 'is-bad'}`}>
        <div className="health-main">
          {db?.ok ? <CheckCircle2 size={26} /> : <TriangleAlert size={26} />}
          <div>
            <h2>{!health ? 'Перевіряємо базу…' : db?.ok ? 'База даних працює' : 'База даних недоступна'}</h2>
            {health && (
              <p>
                {db?.ok
                  ? `У базі ${db.ghosts} привидів і ${db.equipment} предметів.${db.canWrite ? '' : ' Запис вимкнено: не задано SUPABASE_SECRET_KEY.'}`
                  : db?.message}
              </p>
            )}
            {health && !health.ai.configured && <p className="muted">ШІ-асистент вимкнено: не задано GEMINI_API_KEY.</p>}
          </div>
        </div>
        <div className="row-end">
          <button className="btn btn-quiet" onClick={checkHealth} disabled={checking}>
            <RefreshCw size={15} className={checking ? 'spin' : ''} /> Перевірити
          </button>
          {db?.ok && db.canWrite && (
            <button className="btn btn-quiet" onClick={importLocal} disabled={saving} title="Додає з вбудованого довідника записи, яких у базі ще немає. Наявні не змінює.">
              <DatabaseZap size={15} /> Заповнити базу
            </button>
          )}
        </div>
      </section>

      <div className="chips">
        <button className={`chip ${section === 'ghost' ? 'is-on' : ''}`} onClick={() => setSection('ghost')}>Привид</button>
        <button className={`chip ${section === 'equipment' ? 'is-on' : ''}`} onClick={() => setSection('equipment')}>Спорядження</button>
      </div>

      {section === 'ghost' ? (
        <div className="admin-split">
          <form className="panel form" onSubmit={saveGhost}>
            <h2>{editingGhost ? `Редагування: ${editingGhost.name}` : 'Новий привид'}</h2>
            <label>
              Назва
              <input required value={ghost.name} onChange={(e) => setGhost({ ...ghost, name: e.target.value })} placeholder="Дух (Spirit)" />
            </label>
            <label>
              Поріг атаки
              <input required value={ghost.hunt} onChange={(e) => setGhost({ ...ghost, hunt: e.target.value })} placeholder="50% або 60% (темрява) / 40% (світло)" />
            </label>
            <fieldset>
              <legend>Докази</legend>
              <div className="chips">
                {EVIDENCES.map((e) => (
                  <button type="button" key={e} className={`chip ${ghost.evidence.includes(e) ? 'is-on' : ''}`} onClick={() => toggleEvidence(e)} aria-pressed={ghost.evidence.includes(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </fieldset>
            <label>
              Короткий опис
              <textarea rows={2} value={ghost.desc} onChange={(e) => setGhost({ ...ghost, desc: e.target.value })} />
            </label>
            <label>
              Сила
              <textarea rows={2} value={ghost.strength} onChange={(e) => setGhost({ ...ghost, strength: e.target.value })} />
            </label>
            <label>
              Слабкість
              <textarea rows={2} value={ghost.weakness} onChange={(e) => setGhost({ ...ghost, weakness: e.target.value })} />
            </label>
            <label>
              Як перевірити
              <textarea rows={3} value={ghost.test} onChange={(e) => setGhost({ ...ghost, test: e.target.value })} />
            </label>
            <label className="check">
              <input type="checkbox" checked={!!ghost.isNew} onChange={(e) => setGhost({ ...ghost, isNew: e.target.checked })} />
              Позначити як нового
            </label>
            <div className="row-end">
              {(editingGhost || ghost.name) && (
                <button type="button" className="btn btn-quiet" onClick={resetGhost}>Скасувати</button>
              )}
              <button className="btn btn-uv" disabled={saving}>{saving ? 'Зберігаємо…' : editingGhost ? 'Зберегти зміни' : 'Додати привида'}</button>
            </div>
          </form>
          <div className="admin-preview">
            <p className="muted">Так картка виглядатиме на сайті</p>
            <GhostCard ghost={{ ...ghost, name: ghost.name || 'Назва привида', hunt: ghost.hunt || '—' }} admin={null} showDesc />
          </div>
        </div>
      ) : (
        <div className="admin-split">
          <form className="panel form" onSubmit={saveItem}>
            <h2>{editingEquipment ? `Редагування: ${editingEquipment.name}` : 'Нове спорядження'}</h2>
            <label>
              Назва
              <input required value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder="Термометр" />
            </label>
            <div className="form-row">
              <label>
                Емодзі
                <input value={item.icon} onChange={(e) => setItem({ ...item, icon: e.target.value })} placeholder="🌡️" />
              </label>
              <label>
                Фото: файл із public/items або посилання
                <input value={item.image} onChange={(e) => setItem({ ...item, image: e.target.value })} placeholder="thermometer.png" />
              </label>
            </div>
            <label>
              Опис
              <span className="format-bar">
                <button type="button" onClick={() => wrap('<b>', '</b>')}><b>Ж</b></button>
                <button type="button" onClick={() => wrap('<i>', '</i>')}><i>К</i></button>
                <button type="button" onClick={() => wrap('<br>', '')}>↵</button>
                <button type="button" onClick={() => wrap('<ul>\n  <li>', '</li>\n</ul>')}>Список</button>
                <button type="button" onClick={() => wrap('<strong style="color: var(--uv)">', '</strong>')} style={{ color: 'var(--uv)' }}>Рівень</button>
                <button type="button" onClick={() => wrap('<span style="color: #ff6a5e">', '</span>')} style={{ color: '#ff6a5e' }}>Червоний</button>
                <button type="button" onClick={() => wrap('<span style="color: #7fe3a8">', '</span>')} style={{ color: '#7fe3a8' }}>Зелений</button>
              </span>
              <textarea ref={descRef} rows={7} value={item.desc} onChange={(e) => setItem({ ...item, desc: e.target.value })} />
            </label>
            <div className="row-end">
              {(editingEquipment || item.name) && (
                <button type="button" className="btn btn-quiet" onClick={resetItem}>Скасувати</button>
              )}
              <button className="btn btn-uv" disabled={saving}>{saving ? 'Зберігаємо…' : editingEquipment ? 'Зберегти зміни' : 'Додати спорядження'}</button>
            </div>
          </form>
          <div className="admin-preview">
            <p className="muted">Попередній перегляд опису</p>
            <article className="gear">
              <div className="gear-body">
                <h3><span aria-hidden="true">{item.icon}</span> {item.name || 'Назва предмета'}</h3>
                <div className="gear-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc) }} />
              </div>
            </article>
          </div>
        </div>
      )}

      {data.source === 'local' && <p className="muted">Зараз сайт показує вбудований довідник, тому кнопки «Редагувати» на картках працюватимуть лише для записів, які є в базі.</p>}
    </div>
  );
}
