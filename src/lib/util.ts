import { useEffect, useState } from 'react';

/** Стан, що зберігається в localStorage і переживає перезавантаження сторінки. */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* сховище недоступне — працюємо без збереження */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'UL', 'OL', 'LI', 'P', 'DIV', 'SPAN', 'SMALL']);
const SAFE_STYLE = /^(color|font-weight|font-style|font-size|margin(-top|-bottom)?|padding(-left)?|text-decoration)$/;

/** Залишає в HTML з бази лише безпечне форматування (жирний, колір, списки). */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(child.tagName)) child.remove();
        else child.replaceWith(...Array.from(child.childNodes));
        walk(node);
        return;
      }
      const style = (child as HTMLElement).style;
      const kept: string[] = [];
      for (const prop of Array.from(style)) {
        const val = style.getPropertyValue(prop);
        if (SAFE_STYLE.test(prop) && !/url\(|expression/i.test(val)) kept.push(`${prop}: ${val}`);
      }
      for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name);
      if (kept.length) child.setAttribute('style', kept.join('; '));
      walk(child);
    }
  };
  const root = doc.body.firstElementChild!;
  walk(root);
  return root.innerHTML;
}

export const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Короткий звуковий сигнал для таймерів. */
export function beep(times = 2) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.25 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.25 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.22);
    }
    setTimeout(() => ctx.close(), times * 250 + 400);
  } catch {
    /* звук недоступний */
  }
}
