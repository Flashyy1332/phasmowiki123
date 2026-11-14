import { Ghost } from '../types';
import { DEFAULT_SPEED_NOTE_EN, SPEED_NOTES_EN } from './content';
import type { Lang } from './i18n';

/**
 * Швидкість привидів під час полювання (м/с). Базова швидкість — 1.7.
 * Значення для привидів, яких немає в цій таблиці, вважаються стандартними.
 * Ключ — англійська назва з дужок у назві привида.
 */
export interface SpeedInfo {
  min: number;
  max: number;
  /** Чи буває привид рівно на базовій швидкості 1.7 */
  normal: boolean;
  note: string;
}

export const BASE_SPEED = 1.7;

const SPEEDS: Record<string, SpeedInfo> = {
  revenant: { min: 1.0, max: 3.0, normal: false, note: '1.0 без цілі, 3.0 коли бачить або чує гравця' },
  deogen: { min: 0.4, max: 3.0, normal: true, note: '3.0 здалеку, 0.4 впритул до гравця' },
  jinn: { min: 1.7, max: 2.5, normal: true, note: '2.5 здалеку в полі зору, якщо щиток увімкнено' },
  hantu: { min: 1.4, max: 2.7, normal: true, note: 'що холодніше в кімнаті, то швидший; не прискорюється в полі зору' },
  raiju: { min: 1.7, max: 2.5, normal: true, note: '2.5 біля увімкненої електроніки' },
  moroi: { min: 1.5, max: 2.25, normal: true, note: 'що нижчий глузд команди, то швидший' },
  thaye: { min: 1.0, max: 2.75, normal: true, note: '2.75 на початку, сповільнюється зі «старінням» до 1.0' },
  'the twins': { min: 1.53, max: 1.87, normal: false, note: 'основний ≈1.53, приманка ≈1.87' },
  dayan: { min: 1.2, max: 2.25, normal: true, note: '2.25 якщо ви рухаєтесь поруч, 1.2 якщо стоїте' },
  gallu: { min: 1.36, max: 1.96, normal: true, note: '≈1.96 розлючений, ≈1.36 ослаблений' },
  obambo: { min: 1.45, max: 1.96, normal: true, note: '≈1.96 агресивний, ≈1.45 спокійний; стан міняється кожні 2 хв' },
  'the mimic': { min: 0.4, max: 3.0, normal: true, note: 'копіює швидкість привида, якого імітує' },
};

export function ghostKey(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  return (match ? match[1] : name).trim().toLowerCase();
}

export function speedOf(ghost: Ghost, lang: Lang = 'uk'): SpeedInfo {
  const key = ghostKey(ghost.name);
  const info = SPEEDS[key] || { min: BASE_SPEED, max: BASE_SPEED, normal: true, note: 'стандартна 1.7, прискорюється в полі зору' };
  if (lang !== 'en') return info;
  return { ...info, note: SPEED_NOTES_EN[key] || DEFAULT_SPEED_NOTE_EN };
}

export type SpeedClass = 'slow' | 'normal' | 'fast';

export function matchesSpeed(ghost: Ghost, cls: SpeedClass): boolean {
  const s = speedOf(ghost);
  if (cls === 'slow') return s.min < BASE_SPEED - 0.05;
  if (cls === 'fast') return s.max > BASE_SPEED + 0.05;
  return s.normal;
}

/** Усі відсотки з рядка порогу атаки, напр. «60% (темрява) / 40% (світло)» -> [60, 40]. */
export function huntThresholds(ghost: Ghost): number[] {
  return Array.from(ghost.hunt.matchAll(/(\d{1,3})\s*%/g)).map((m) => Number(m[1]));
}

/** Найвищий глузд, за якого привид може почати полювання. null — невідомо (напр. Мімік). */
export function maxHuntThreshold(ghost: Ghost): number | null {
  const values = huntThresholds(ghost);
  return values.length ? Math.max(...values) : null;
}

/**
 * Приблизний перерахунок темпу кроків у швидкість: 1.7 м/с ≈ 115 кроків за хвилину.
 */
export const BPM_PER_MS = 115 / BASE_SPEED;
export const bpmToSpeed = (bpm: number) => bpm / BPM_PER_MS;

export const isMimic = (ghost: Ghost) => ghostKey(ghost.name).includes('mimic') || ghost.name.includes('Мімік');
export const FAKE_EVIDENCE = 'Примарний вогник';

export const EVIDENCE_ICONS: Record<string, string> = {
  'ЕМП (рівень 5)': '📈',
  'Радіоприймач': '📻',
  'Відбитки (УФ)': '🖐️',
  'Примарний вогник': '🔮',
  'Блокнот': '📖',
  'Мінусова температура': '❄️',
  'D.O.T.S. проєктор': '🟢',
};
