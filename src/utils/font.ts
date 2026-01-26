import { loadFont } from '@remotion/google-fonts/NotoSansJP';

// Noto Sans JPフォントをロード
const { fontFamily } = loadFont();

// フォントファミリーをエクスポート
export const FONT_FAMILY = fontFamily;
