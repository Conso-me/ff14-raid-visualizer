import type { MechanicData } from './types';
import { sampleLethalScourge } from './sampleLethalScourge';

export interface SampleEntry {
  id: string;
  name: string;
  description: string;
  data: MechanicData;
}

export const sampleMechanics: SampleEntry[] = [
  {
    id: 'lethal-scourge',
    name: 'リーサルスカージ',
    description: '玉A〜Dを2人ずつ順番に受けるギミック。8人の移動パターンを確認できます。',
    data: sampleLethalScourge,
  },
];
