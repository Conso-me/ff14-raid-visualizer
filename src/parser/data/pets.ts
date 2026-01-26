// Pet names for filtering from player list
// Pets should be excluded when importing ACT logs

export const PET_NAMES = [
  // 学者 (Scholar)
  'フェアリー・エオス', 'フェアリー・セレネ', 'セラフィム',
  'Eos', 'Selene', 'Seraph',
  // 召喚士 (Summoner)
  'カーバンクル', 'イフリート・エギ', 'タイタン・エギ', 'ガルーダ・エギ',
  'デミ・バハムート', 'デミ・フェニックス', 'ソーラーバハムート',
  'Carbuncle', 'Ifrit-Egi', 'Titan-Egi', 'Garuda-Egi',
  'Demi-Bahamut', 'Demi-Phoenix', 'Solar Bahamut',
  // 機工士 (Machinist)
  'オートマトン・クイーン', 'オートマトン', 'Automaton Queen',
  // リーパー (Reaper)
  'アヴァター', 'Avatar', '英雄の影身',
  // 占星術師 (Astrologian)
  'アーサリースター', 'Earthly Star',
  // 白魔道士 (White Mage)
  'リタージーベル', 'リタージー・オブ・ベル', 'Liturgy Bell', 'Liturgy of the Bell',
  // ピクトマンサー (Pictomancer)
  'クリーチャー', 'Creature',
];

export function isPetName(name: string): boolean {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return PET_NAMES.some(pet => lowerName.includes(pet.toLowerCase()));
}
