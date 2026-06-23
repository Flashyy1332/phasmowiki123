import React, { useState, useEffect, useRef } from 'react';
import { Ghost, Equipment } from '../types';

interface AdminTabProps {
  userEmail: string;
  editingGhost?: Ghost | null;
  setEditingGhost?: (ghost: Ghost | null) => void;
  editingEquipment?: Equipment | null;
  setEditingEquipment?: (equipment: Equipment | null) => void;
  onRefresh?: () => void;
}

export function AdminTab({ userEmail, editingGhost, setEditingGhost, editingEquipment, setEditingEquipment, onRefresh }: AdminTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ghost' | 'equipment'>('ghost');
  
  const ghostDescRef = useRef<HTMLTextAreaElement>(null);
  const eqDescRef = useRef<HTMLTextAreaElement>(null);
  
  // Ghost Form
  const [ghostName, setGhostName] = useState('');
  const [ghostHunt, setGhostHunt] = useState('');
  const [ghostEvidences, setGhostEvidences] = useState('');
  const [ghostDesc, setGhostDesc] = useState('');
  const [ghostStrength, setGhostStrength] = useState('');
  const [ghostWeakness, setGhostWeakness] = useState('');
  const [ghostTest, setGhostTest] = useState('');
  
  // Equipment Form
  const [eqName, setEqName] = useState('');
  const [eqIcon, setEqIcon] = useState('');
  const [eqImageName, setEqImageName] = useState('');
  const [eqDesc, setEqDesc] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editingGhost) {
      setActiveSubTab('ghost');
      setGhostName(editingGhost.name);
      setGhostHunt(editingGhost.hunt);
      setGhostEvidences(editingGhost.evidence.join(', '));
      setGhostDesc(editingGhost.desc);
      setGhostStrength(editingGhost.strength);
      setGhostWeakness(editingGhost.weakness);
      setGhostTest(editingGhost.test);
    }
  }, [editingGhost]);

  useEffect(() => {
    if (editingEquipment) {
      setActiveSubTab('equipment');
      setEqName(editingEquipment.name);
      setEqIcon(editingEquipment.icon);
      setEqImageName(editingEquipment.image || '');
      setEqDesc(editingEquipment.desc);
    }
  }, [editingEquipment]);

  const cancelEdit = () => {
    if (setEditingGhost) setEditingGhost(null);
    setGhostName(''); setGhostHunt(''); setGhostEvidences('');
    setGhostDesc(''); setGhostStrength(''); setGhostWeakness(''); setGhostTest('');
    setMessage('');
  };

  const cancelEquipmentEdit = () => {
    if (setEditingEquipment) setEditingEquipment(null);
    setEqName(''); setEqIcon(''); setEqImageName(''); setEqDesc('');
    setMessage('');
  };

  const handleGhostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const url = editingGhost 
        ? `/api/ghosts/${encodeURIComponent(editingGhost.name)}` 
        : '/api/ghosts';
      const method = editingGhost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: userEmail,
          ghost: {
            name: ghostName,
            huntThreshold: ghostHunt,
            evidences: ghostEvidences, // string or csv
            description: ghostDesc,
            strength: ghostStrength,
            weakness: ghostWeakness,
            testToVerify: ghostTest
          }
        })
      });
      if (res.ok) {
        setMessage(editingGhost ? 'Привида успішно оновлено!' : 'Привида успішно додано!');
        if (!editingGhost) {
          setGhostName(''); setGhostHunt(''); setGhostEvidences('');
          setGhostDesc(''); setGhostStrength(''); setGhostWeakness(''); setGhostTest('');
        }
        if (onRefresh) onRefresh();
      } else {
        const error = await res.json();
        setMessage(`Помилка: ${error.error || 'Невідома помилка'}`);
      }
    } catch (err: any) {
      setMessage(`Помилка: ${err.message}`);
    }
    setLoading(false);
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const url = editingEquipment
        ? `/api/equipment/${encodeURIComponent(editingEquipment.name)}`
        : '/api/equipment';
      const method = editingEquipment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: userEmail,
          equipment: {
            name: eqName,
            icon: eqIcon,
            imageName: eqImageName,
            description: eqDesc,
          }
        })
      });
      if (res.ok) {
        setMessage(editingEquipment ? 'Спорядження успішно оновлено!' : 'Спорядження успішно додано!');
        if (!editingEquipment) {
          setEqName(''); setEqIcon(''); setEqImageName(''); setEqDesc('');
        }
        if (onRefresh) onRefresh();
      } else {
        const error = await res.json();
        setMessage(`Помилка: ${error.error || 'Невідома помилка'}`);
      }
    } catch (err: any) {
      setMessage(`Помилка: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <section className="tab-content active" style={{ padding: '20px' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '15px' }}>Панель Адміністратора</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '15px' }}>
          <button 
            className={`nav-btn ${activeSubTab === 'ghost' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('ghost'); setMessage(''); cancelEquipmentEdit(); }}
          >
            Додати Привида
          </button>
          <button 
            className={`nav-btn ${activeSubTab === 'equipment' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('equipment'); setMessage(''); cancelEdit(); }}
          >
            Додати Спорядження
          </button>
        </div>

        {message && (
          <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.includes('Помилка') ? '#ef4444' : '#22c55e', color: '#fff' }}>
            {message}
          </div>
        )}

        {activeSubTab === 'ghost' && (
          <form onSubmit={handleGhostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {editingGhost && (
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-purple)' }}>
                <strong>Режим редагування:</strong> {editingGhost.name}
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Назва привида</label>
              <input type="text" value={ghostName} onChange={(e) => setGhostName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Поріг атаки (Hunt Threshold)</label>
              <input type="text" value={ghostHunt} onChange={(e) => setGhostHunt(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} placeholder="напр. 50%" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Докази (через кому)</label>
              <input type="text" value={ghostEvidences} onChange={(e) => setGhostEvidences(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} placeholder="напр. ЕМП (рівень 5), Радіоприймач, Блокнот" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Опис (Description)</label>
              <EditorToolbar targetRef={ghostDescRef} val={ghostDesc} setVal={setGhostDesc} />
              <textarea ref={ghostDescRef} value={ghostDesc} onChange={(e) => setGhostDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Сила (Strength)</label>
              <textarea value={ghostStrength} onChange={(e) => setGhostStrength(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Слабкість (Weakness)</label>
              <textarea value={ghostWeakness} onChange={(e) => setGhostWeakness(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Тест для перевірки (Test)</label>
              <textarea value={ghostTest} onChange={(e) => setGhostTest(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--accent-purple)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Збереження...' : (editingGhost ? 'Зберегти Зміни' : 'Додати Привида')}
              </button>
              {editingGhost && (
                <button type="button" onClick={cancelEdit} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--card-border)', color: 'var(--text-title)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Скасувати
                </button>
              )}
            </div>
          </form>
        )}

        {activeSubTab === 'equipment' && (
          <form onSubmit={handleEquipmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {editingEquipment && (
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid var(--accent-purple)' }}>
                <strong>Режим редагування:</strong> {editingEquipment.name}
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Назва спорядження</label>
              <input type="text" value={eqName} onChange={(e) => setEqName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Іконка (Емодзі)</label>
              <input type="text" value={eqIcon} onChange={(e) => setEqIcon(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} placeholder="напр. 📸" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Назва файлу зображення / URL (image_url)</label>
              <input type="text" value={eqImageName} onChange={(e) => setEqImageName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} placeholder="напр. temp.png" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Опис (Description)</label>
              <EditorToolbar targetRef={eqDescRef} val={eqDesc} setVal={setEqDesc} />
              <textarea ref={eqDescRef} value={eqDesc} onChange={(e) => setEqDesc(e.target.value)} rows={5} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--accent-purple)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Збереження...' : (editingEquipment ? 'Зберегти Зміни' : 'Додати Спорядження')}
              </button>
              {editingEquipment && (
                <button type="button" onClick={cancelEquipmentEdit} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--card-border)', color: 'var(--text-title)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Скасувати
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

const EditorToolbar = ({ targetRef, val, setVal }: { targetRef: React.RefObject<HTMLTextAreaElement>, val: string, setVal: (val: string) => void }) => {
  const insertFormat = (startTag: string, endTag: string) => {
    const textarea = targetRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = val.substring(0, start) + startTag + val.substring(start, end) + endTag + val.substring(end);
    setVal(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + (end - start));
    }, 0);
  };

  const btnStyle = { padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', background: 'var(--bg-main)' };

  return (
    <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => insertFormat('<b>', '</b>')} style={{ ...btnStyle, color: 'var(--text-main)', fontWeight: 'bold' }}>B</button>
      <button type="button" onClick={() => insertFormat('<i>', '</i>')} style={{ ...btnStyle, color: 'var(--text-main)', fontStyle: 'italic' }}>I</button>
      <button type="button" onClick={() => insertFormat('<br />', '')} style={{ ...btnStyle, color: 'var(--text-main)' }}>↵ (Break)</button>
      <button type="button" onClick={() => insertFormat('<ul>\\n  <li>', '</li>\\n</ul>')} style={{ ...btnStyle, color: 'var(--text-main)' }}>List</button>
      
      <span style={{ margin: '0 5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>|</span>
      
      <button type="button" onClick={() => insertFormat('<span style="color: #ef4444;">', '</span>')} style={{ ...btnStyle, color: '#ef4444', borderColor: '#ef4444' }}>Червоний</button>
      <button type="button" onClick={() => insertFormat('<span style="color: #22c55e;">', '</span>')} style={{ ...btnStyle, color: '#22c55e', borderColor: '#22c55e' }}>Зелений</button>
      <button type="button" onClick={() => insertFormat('<span style="color: #eab308;">', '</span>')} style={{ ...btnStyle, color: '#eab308', borderColor: '#eab308' }}>Жовтий</button>
      <button type="button" onClick={() => insertFormat('<span style="color: var(--accent-purple);">', '</span>')} style={{ ...btnStyle, color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>Фіолетовий</button>
    </div>
  );
};
