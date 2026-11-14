import { Ghost, Equipment } from '../types';
import { GHOSTS, EQUIPMENT } from '../data';
import { getIdToken } from './firebase';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T = any>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = await getIdToken().catch(() => null);
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Немає зв’язку із сервером. Перевірте інтернет.', 0, 'network');
  }
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* сервер повернув не JSON */
  }
  if (!response.ok) {
    throw new ApiError(data?.error || `Помилка сервера (${response.status})`, response.status, data?.code);
  }
  return data as T;
}

const imagePath = (name: string) => (!name ? '' : /^(https?:)?\/\//.test(name) || name.startsWith('/') ? name : `/items/${name}`);

export const sortGhosts = (list: Ghost[]) =>
  [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || a.name.localeCompare(b.name, 'uk'));

const NEW_LOCAL = ['Даян', 'Галлу', 'Обамбо'];

export const LOCAL_GHOSTS: Ghost[] = sortGhosts(
  GHOSTS.map((g) => ({ ...g, isNew: NEW_LOCAL.some((n) => g.name.startsWith(n)) })),
);
export const LOCAL_EQUIPMENT: Equipment[] = EQUIPMENT.map((e) => ({ ...e, image: imagePath(e.image) }));

export interface WikiData {
  ghosts: Ghost[];
  equipment: Equipment[];
  /** live — дані з бази; local — вбудована копія, бо база недоступна або порожня */
  source: 'live' | 'local';
  problem?: string;
}

export async function loadWikiData(): Promise<WikiData> {
  try {
    const [ghostRows, equipmentRows] = await Promise.all([api<any[]>('/api/ghosts'), api<any[]>('/api/equipment')]);
    if (!Array.isArray(ghostRows) || !Array.isArray(equipmentRows)) throw new ApiError('Сервер повернув неочікувані дані.', 500);

    const ghosts: Ghost[] = ghostRows
      .filter((g) => g?.name)
      .map((g) => ({
        name: g.name,
        isNew: !!g.isNew,
        hunt: g.huntThreshold || '—',
        evidence: Array.isArray(g.evidences) ? g.evidences : [],
        desc: g.description || '',
        strength: g.strength || '',
        weakness: g.weakness || '',
        test: g.testToVerify || '',
      }));
    const equipment: Equipment[] = equipmentRows
      .filter((e) => e?.name)
      .map((e) => ({ name: e.name, icon: e.icon || '', image: imagePath(e.imageName || ''), desc: e.description || '' }));

    if (ghosts.length === 0) {
      return { ghosts: LOCAL_GHOSTS, equipment: equipment.length ? equipment : LOCAL_EQUIPMENT, source: 'local', problem: 'База підключена, але таблиця привидів порожня.' };
    }
    return { ghosts: sortGhosts(ghosts), equipment: equipment.length ? equipment : LOCAL_EQUIPMENT, source: 'live' };
  } catch (e: any) {
    return { ghosts: LOCAL_GHOSTS, equipment: LOCAL_EQUIPMENT, source: 'local', problem: e?.message || 'База даних недоступна.' };
  }
}
