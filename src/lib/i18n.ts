import { useMemo, useSyncExternalStore } from 'react';
import { en, Key, uk } from './locales';
import { EVIDENCE_EN } from './content';
import type { Equipment, Ghost } from '../types';

export type Lang = 'uk' | 'en';
export type { Key };

const STORAGE_KEY = 'phasmo.lang';
const dictionaries: Record<Lang, Record<Key, string>> = { uk, en };

/** Збережений вибір; без нього — англійська лише для англомовних браузерів, інакше українська. */
function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'uk' || saved === 'en') return saved;
  } catch {
    /* сховище недоступне */
  }
  return typeof navigator !== 'undefined' && /^en\b/i.test(navigator.language || '') ? 'en' : 'uk';
}

let current: Lang = detect();
const listeners = new Set<() => void>();

export const getLang = () => current;

function format(template: string, params?: Record<string, string | number>) {
  return params ? template.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m)) : template;
}

/** Переклад поза React (наприклад, у api.ts). Усередині компонентів беріть t з useI18n. */
export function t(key: Key, params?: Record<string, string | number>): string {
  return format(dictionaries[current][key] ?? dictionaries.uk[key] ?? key, params);
}

function applyDocument() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = current;
  document.title = t('app.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('app.description'));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', t('app.title'));
}

export function setLang(next: Lang) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* сховище недоступне */
  }
  applyDocument();
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

applyDocument();

/* ------------------- Локалізація записів довідника ------------------- */

const englishPart = (name: string) => name.match(/\(([^)]+)\)/)?.[1].trim();

export function ghostName(ghost: Ghost, lang: Lang): string {
  return lang === 'en' ? englishPart(ghost.name) || ghost.en?.name || ghost.name : ghost.name;
}

export function ghostField(ghost: Ghost, field: 'hunt' | 'desc' | 'strength' | 'weakness' | 'test', lang: Lang): string {
  return (lang === 'en' && ghost.en?.[field]) || ghost[field];
}

export const equipmentName = (item: Equipment, lang: Lang) => (lang === 'en' && item.en?.name) || item.name;
export const equipmentDesc = (item: Equipment, lang: Lang) => (lang === 'en' && item.en?.desc) || item.desc;
export const evidenceLabel = (evidence: string, lang: Lang) => (lang === 'en' && EVIDENCE_EN[evidence]) || evidence;

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLang);
  return useMemo(
    () => ({
      lang,
      t,
      setLang,
      gName: (g: Ghost) => ghostName(g, lang),
      gField: (g: Ghost, f: 'hunt' | 'desc' | 'strength' | 'weakness' | 'test') => ghostField(g, f, lang),
      eName: (e: Equipment) => equipmentName(e, lang),
      eDesc: (e: Equipment) => equipmentDesc(e, lang),
      ev: (e: string) => evidenceLabel(e, lang),
    }),
    [lang],
  );
}
