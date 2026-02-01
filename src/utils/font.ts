import { loadFont } from '@remotion/google-fonts/NotoSansJP';

// Noto Sans JPフォントをロード（必要なウェイトのみ）
const { fontFamily } = loadFont('normal', {
  weights: ['400', '700'],
  ignoreTooManyRequestsWarning: true,
});

// フォントファミリーをエクスポート
export const FONT_FAMILY = fontFamily;
