import type { EquipmentText, GhostText } from './lib/content';

export interface Ghost {
  name: string;
  isNew?: boolean;
  hunt: string;
  evidence: string[];
  desc: string;
  strength: string;
  weakness: string;
  test: string;
  /** Англійський переклад, якщо він є для цього привида. */
  en?: GhostText;
}

export interface Equipment {
  name: string;
  icon: string;
  image: string;
  desc: string;
  /** Англійський переклад, якщо він є для цього предмета. */
  en?: EquipmentText;
}
