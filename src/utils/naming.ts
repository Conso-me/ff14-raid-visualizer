/**
 * 既存の名前リストと重複しないユニークな名前を生成する。
 * 常に連番付き（「baseName 1」「baseName 2」…）で生成する。
 */
export function generateUniqueName(baseName: string, existingNames: string[]): string {
  let i = 1;
  while (existingNames.includes(`${baseName} ${i}`)) i++;
  return `${baseName} ${i}`;
}
