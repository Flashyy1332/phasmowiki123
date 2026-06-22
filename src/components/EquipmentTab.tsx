import React from 'react';
import { Equipment } from '../types';

interface Props {
  equipment: Equipment[];
  isAdmin?: boolean;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (name: string) => void;
}

export function EquipmentTab({ equipment, isAdmin, onEdit, onDelete }: Props) {
  return (
    <section id="equipment" className="tab-content active">
      <h2>Ігрове Обладнання та Предмети</h2>

      <div
        className="card"
        style={{
          marginBottom: '25px',
          borderLeft: '4px solid var(--accent-purple)',
          background: 'rgba(56, 189, 248, 0.05)',
        }}
      >
        <h3
          style={{
            color: 'var(--accent-purple)',
            marginBottom: '10px',
            fontSize: '1.2rem',
          }}
        >
          ⭐ Рівні спорядження
        </h3>
        <p
          style={{
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          У грі існують <strong>предмети 1, 2 та 3 рівнів</strong>. Кожен
          предмет можна покращити у лобі, використовуючи зароблені гроші та
          підвищуючи рівень персонажа.
          <br />
          <br />
          <span style={{ color: 'var(--text-title)' }}>
            • <strong>1 рівень:</strong>
          </span>{' '}
          Старе, аналогове або зношене обладнання (наприклад, касетний аудіо
          рекордер або старий термометр). Працює повільно або має малий радіус
          дії.
          <br />
          <span style={{ color: 'var(--text-title)' }}>
            • <strong>2 рівень:</strong>
          </span>{' '}
          Стандартне сучасне спорядження (електронний ЕМП, цифровий термометр).
          Надійне та зручне.
          <br />
          <span style={{ color: 'var(--text-title)' }}>
            • <strong>3 рівень:</strong>
          </span>{' '}
          Високотехнологічні прилади. Працюють миттєво, мають величезний радіус
          дії та спеціальні функції (наприклад, екранний термометр або потужний
          прожектор).
        </p>
        <p
          style={{
            textAlign: 'center',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--accent-purple)',
            fontWeight: 'bold',
            fontSize: '0.95rem',
          }}
        >
          📸 Зверніть увагу: на всіх фотографіях спорядження нижче зображені
          предмети 3-го рівня.
        </p>
      </div>

      <div className="grid-cards">
        {equipment.map((item) => (
          <div
            key={item.name}
            className="card"
            style={{ justifyContent: 'flex-start', padding: '20px' }}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="eq-image"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                justifyContent: 'flex-start',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '2.2rem',
                  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                }}
              >
                {item.icon}
              </span>
              {item.name}
            </h3>
            <div
              style={{
                color: 'var(--text-main)',
                marginTop: '10px',
                padding: '10px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '10px',
                lineHeight: 1.5,
              }}
              dangerouslySetInnerHTML={{ __html: item.desc }}
            />
            {isAdmin && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--card-border)' }}>
                <button onClick={() => { if (onEdit) onEdit(item); }} className="nav-btn" style={{ flex: 1, backgroundColor: 'var(--accent-purple)', color: '#000', fontSize: '0.9em', padding: '6px' }}>Редагувати</button>
                <button onClick={() => { if (onDelete) onDelete(item.name); }} className="nav-btn" style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', fontSize: '0.9em', padding: '6px' }}>Видалити</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
