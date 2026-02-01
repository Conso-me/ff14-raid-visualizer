// ブラウザ内動画レンダリングユーティリティ
// @remotion/web-renderer を動的インポートでラップし、バンドルサイズを最適化する

import { createElement } from 'react';
import type { MechanicData } from '../../data/types';

// --- 型定義 ---

export type WebRendererQuality = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

export interface WebRenderSettings {
  container: 'mp4' | 'webm';
  videoCodec?: 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';
  quality: 'low' | 'medium' | 'high' | 'very-high';
  scale: number; // 0.5 | 0.75 | 1.0
}

export interface WebRenderProgress {
  renderedFrames: number;
  encodedFrames: number;
  totalFrames: number;
  percentComplete: number;
}

export interface CompatibilityCheckResult {
  canRender: boolean;
  issues: Array<{ type: string; message: string; severity: string }>;
  resolvedVideoCodec: string;
  resolvedAudioCodec: string | null;
  availableVideoCodecs: string[];
  availableAudioCodecs: string[];
}

// 基本解像度（MechanicComposition のレイアウト基準サイズ）
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

/**
 * ブラウザの互換性をチェックする
 * WebCodecs API の対応状況と、指定設定でのレンダリング可否を確認する
 */
export async function checkBrowserCompatibility(
  settings?: Partial<WebRenderSettings>
): Promise<CompatibilityCheckResult> {
  const container = settings?.container ?? 'mp4';
  const videoCodec = settings?.videoCodec;
  const scale = settings?.scale ?? 1.0;
  const width = Math.round(BASE_WIDTH * scale);
  const height = Math.round(BASE_HEIGHT * scale);

  try {
    const { canRenderMediaOnWeb, getEncodableVideoCodecs, getEncodableAudioCodecs } =
      await import('@remotion/web-renderer');

    // 互換性チェック（出力解像度でチェック）
    const result = await canRenderMediaOnWeb({
      width,
      height,
      container,
      ...(videoCodec ? { videoCodec } : {}),
      muted: true,
    });

    // 利用可能なコーデック一覧を取得
    let availableVideoCodecs: string[] = [];
    let availableAudioCodecs: string[] = [];

    try {
      availableVideoCodecs = await getEncodableVideoCodecs(container);
    } catch {
      // コーデック取得失敗は無視
    }

    try {
      availableAudioCodecs = await getEncodableAudioCodecs(container);
    } catch {
      // コーデック取得失敗は無視
    }

    return {
      canRender: result.canRender,
      issues: result.issues ?? [],
      resolvedVideoCodec: result.resolvedVideoCodec ?? '',
      resolvedAudioCodec: result.resolvedAudioCodec ?? null,
      availableVideoCodecs,
      availableAudioCodecs,
    };
  } catch (err) {
    // ライブラリの読み込み自体に失敗した場合
    return {
      canRender: false,
      issues: [{
        type: 'webcodecs-unavailable',
        message: 'このブラウザは WebCodecs API に対応していません。Chrome 94+ または Edge 94+ をお使いください。',
        severity: 'error',
      }],
      resolvedVideoCodec: '',
      resolvedAudioCodec: null,
      availableVideoCodecs: [],
      availableAudioCodecs: [],
    };
  }
}

interface RenderOptions {
  mechanic: MechanicData;
  settings: WebRenderSettings;
  onProgress?: (progress: WebRenderProgress) => void;
  signal?: AbortSignal;
}

/**
 * ブラウザ内でメカニック動画をレンダリングする
 * @remotion/web-renderer の renderMediaOnWeb を使用
 *
 * 注意: renderMediaOnWeb の scale パラメータは実験的APIのバグにより
 * フレーム数/再生時間にも影響するため使用しない。
 * 代わりに CSS transform でコンテンツをスケーリングし、
 * コンポジションの width/height で出力解像度を制御する。
 */
export async function renderMechanicOnWeb({
  mechanic,
  settings,
  onProgress,
  signal,
}: RenderOptions): Promise<Blob> {
  const { renderMediaOnWeb } = await import('@remotion/web-renderer');
  const { MechanicComposition } = await import('../../compositions/MechanicComposition');

  const renderScale = settings.scale;
  const outputWidth = Math.round(BASE_WIDTH * renderScale);
  const outputHeight = Math.round(BASE_HEIGHT * renderScale);
  const totalFrames = mechanic.durationFrames;

  // スケール対応ラッパーコンポーネント
  // コンポジションの出力サイズ（outputWidth x outputHeight）のビューポート内に
  // 1920x1080 のコンテンツを CSS transform で縮小して描画する
  const WrappedComponent = (props: { mechanic: MechanicData }) => {
    // scale=1 の場合はラップ不要
    if (renderScale >= 1) {
      return createElement(MechanicComposition, { mechanic: props.mechanic });
    }
    return createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      },
    },
      createElement('div', {
        style: {
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${renderScale})`,
          transformOrigin: 'top left',
        },
      },
        createElement(MechanicComposition, { mechanic: props.mechanic })
      )
    );
  };

  const composition = {
    id: `mechanic-${mechanic.id}`,
    component: WrappedComponent,
    durationInFrames: totalFrames,
    fps: mechanic.fps,
    width: outputWidth,
    height: outputHeight,
    defaultProps: { mechanic },
  };

  const { getBlob } = await renderMediaOnWeb({
    composition: composition as any,
    inputProps: { mechanic } as any,
    container: settings.container,
    videoCodec: settings.videoCodec,
    videoBitrate: settings.quality as WebRendererQuality,
    scale: 1, // CSS transform でスケーリング済みのため常に 1
    muted: true,
    signal: signal ?? null,
    licenseKey: 'free-license',
    onProgress: onProgress
      ? ({ renderedFrames, encodedFrames }: { renderedFrames: number; encodedFrames: number }) => {
          onProgress({
            renderedFrames,
            encodedFrames,
            totalFrames,
            percentComplete: Math.round((encodedFrames / totalFrames) * 100),
          });
        }
      : null,
  });

  return await getBlob();
}
