export interface Ghost {
  name: string;
  isNew?: boolean;
  hunt: string;
  evidence: string[];
  desc: string;
  strength: string;
  weakness: string;
  test: string;
}

export interface Equipment {
  name: string;
  icon: string;
  image: string;
  desc: string;
}
