import { Ghost, Equipment } from '../types';
import { GHOSTS, EQUIPMENT } from '../data';
import { getIdToken } from './firebase';
import { EQUIPMENT_EN, GHOSTS_EN } from './content';
import { ghostKey } from './ghostMeta';
import { ghostName, Key, Lang, t } from './i18n';

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
    throw new ApiError(t('err.network'), 0, 'network');
  }
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* сервер повернув не JSON */
  }
  if (!response.ok) {
    throw new ApiError(data?.error || t('err.server', { status: response.status }), response.status, data?.code);
  }
  return data as T;
}

const imagePath = (name: string) => (!name ? '' : /^(https?:)?\/\//.test(name) || name.startsWith('/') ? name : `/items/${name}`);

/** Нові привиди — першими, решта за назвою у вибраній мові. */
export const sortGhosts = (list: Ghost[], lang: Lang = 'uk') =>
  [...list].sort(
    (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || ghostName(a, lang).localeCompare(ghostName(b, lang), lang === 'en' ? 'en' : 'uk'),
  );

/** Підключає англійський переклад до привида, якщо він є в довіднику. */
const withGhostEnglish = (g: Ghost): Ghost => ({ ...g, en: GHOSTS_EN[ghostKey(g.name)] });

/** Ім’я файлу фото без шляху і розширення: «/items/emf.png» -> «emf». */
const imageKey = (image: string) => image.split('/').pop()?.replace(/\.[^.]+$/, '').toLowerCase() || '';
const withEquipmentEnglish = (e: Equipment): Equipment => ({ ...e, en: EQUIPMENT_EN[imageKey(e.image)] });

const NEW_LOCAL = ['Даян', 'Галлу', 'Обамбо'];

export const LOCAL_GHOSTS: Ghost[] = sortGhosts(
  GHOSTS.map((g) => withGhostEnglish({ ...g, isNew: NEW_LOCAL.some((n) => g.name.startsWith(n)) })),
);
export const LOCAL_EQUIPMENT: Equipment[] = EQUIPMENT.map((e) => withEquipmentEnglish({ ...e, image: imagePath(e.image) }));

export interface WikiData {
  ghosts: Ghost[];
  equipment: Equipment[];
  /** live — дані з бази; local — вбудована копія, бо база недоступна або порожня */
  source: 'live' | 'local';
  /** Текст помилки від сервера (як є). */
  problem?: string;
  /** Ключ власного повідомлення — перекладається під час показу, а не під час завантаження. */
  problemKey?: Key;
}

const PROBLEM_KEYS: Record<string, Key> = { network: 'err.network', unexpected: 'err.unexpected' };

export async function loadWikiData(): Promise<WikiData> {
  try {
    const [ghostRows, equipmentRows] = await Promise.all([api<any[]>('/api/ghosts'), api<any[]>('/api/equipment')]);
    if (!Array.isArray(ghostRows) || !Array.isArray(equipmentRows)) throw new ApiError(t('err.unexpected'), 500, 'unexpected');

    const ghosts: Ghost[] = ghostRows
      .filter((g) => g?.name)
      .map((g) =>
        withGhostEnglish({
          name: g.name,
          isNew: !!g.isNew,
          hunt: g.huntThreshold || '—',
          evidence: Array.isArray(g.evidences) ? g.evidences : [],
          desc: g.description || '',
          strength: g.strength || '',
          weakness: g.weakness || '',
          test: g.testToVerify || '',
        }),
      );
    const equipment: Equipment[] = equipmentRows
      .filter((e) => e?.name)
      .map((e) => withEquipmentEnglish({ name: e.name, icon: e.icon || '', image: imagePath(e.imageName || ''), desc: e.description || '' }));

    if (ghosts.length === 0) {
      return { ghosts: LOCAL_GHOSTS, equipment: equipment.length ? equipment : LOCAL_EQUIPMENT, source: 'local', problemKey: 'err.dbEmpty' };
    }
    return { ghosts: sortGhosts(ghosts), equipment: equipment.length ? equipment : LOCAL_EQUIPMENT, source: 'live' };
  } catch (e: any) {
    const problemKey = PROBLEM_KEYS[e?.code] || (e?.message ? undefined : 'status.unavailable');
    return { ghosts: LOCAL_GHOSTS, equipment: LOCAL_EQUIPMENT, source: 'local', problemKey, problem: problemKey ? undefined : e?.message };
  }
}
