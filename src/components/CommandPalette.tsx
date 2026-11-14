import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export interface PaletteItem {
  id: string;
  group: string;
  title: string;
  hint?: string;
  /** Показувати у списку, коли пошуковий запит порожній. */
  top?: boolean;
  run: () => void;
}

export function CommandPalette({ open, onClose, items }: { open: boolean; onClose: () => void; items: PaletteItem[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle ? items.filter((i) => `${i.title} ${i.hint || ''}`.toLowerCase().includes(needle)) : items.filter((i) => i.top);
    return list.slice(0, 40);
  }, [items, query]);

  useEffect(() => {
    listRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (item?: PaletteItem) => {
    if (!item) return;
    onClose();
    item.run();
  };

  return (
    <div className="overlay overlay-top" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-label={t('palette.aria')}>
        <label className="palette-input">
          <Search size={18} />
          <input
            autoFocus
            value={query}
            placeholder={t('palette.placeholder')}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, shown.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter') run(shown[active]);
              else if (e.key === 'Escape') onClose();
            }}
          />
          <kbd>Esc</kbd>
        </label>
        <ul ref={listRef}>
          {shown.length === 0 && <li className="palette-empty">{t('palette.empty', { q: query })}</li>}
          {shown.map((item, i) => (
            <li key={item.id}>
              <button className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)} onClick={() => run(item)}>
                <span>
                  {item.title}
                  {item.hint && <small>{item.hint}</small>}
                </span>
                <em>{item.group}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
