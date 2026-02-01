// ブラウザ内動画レンダリングの状態管理フック

import { useState, useCallback, useRef } from 'react';
import type { MechanicData } from '../../data/types';
import type {
  WebRenderSettings,
  WebRenderProgress,
  CompatibilityCheckResult,
} from '../utils/webRenderer';

export type WebRenderStatus = 'idle' | 'checking' | 'rendering' | 'completed' | 'failed';

export interface UseWebRendererReturn {
  status: WebRenderStatus;
  progress: WebRenderProgress | null;
  error: string | null;
  videoBlob: Blob | null;
  compatibility: CompatibilityCheckResult | null;
  startRender: (mechanic: MechanicData, settings: WebRenderSettings) => Promise<void>;
  cancelRender: () => void;
  downloadVideo: (filename: string, container: 'mp4' | 'webm') => void;
  reset: () => void;
  checkCompatibility: (settings?: Partial<WebRenderSettings>) => Promise<CompatibilityCheckResult>;
}

export function useWebRenderer(): UseWebRendererReturn {
  const [status, setStatus] = useState<WebRenderStatus>('idle');
  const [progress, setProgress] = useState<WebRenderProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityCheckResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    // 前回の Blob URL を解放
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setStatus('idle');
    setProgress(null);
    setError(null);
    setVideoBlob(null);
  }, []);

  const checkCompatibility = useCallback(async (
    settings?: Partial<WebRenderSettings>
  ): Promise<CompatibilityCheckResult> => {
    const { checkBrowserCompatibility } = await import('../utils/webRenderer');
    const result = await checkBrowserCompatibility(settings);
    setCompatibility(result);
    return result;
  }, []);

  const cancelRender = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setProgress(null);
  }, []);

  const startRender = useCallback(async (
    mechanic: MechanicData,
    settings: WebRenderSettings
  ) => {
    // 前回のレンダリング結果をクリア
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setVideoBlob(null);
    setError(null);
    setProgress(null);

    // 互換性チェック
    setStatus('checking');
    try {
      const { checkBrowserCompatibility, renderMechanicOnWeb } =
        await import('../utils/webRenderer');

      const compat = await checkBrowserCompatibility(settings);
      setCompatibility(compat);

      if (!compat.canRender) {
        const errorMsg = compat.issues
          .map((i) => i.message)
          .join('\n');
        setError(errorMsg || 'このブラウザではレンダリングできません');
        setStatus('failed');
        return;
      }

      // レンダリング開始
      setStatus('rendering');
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const blob = await renderMechanicOnWeb({
        mechanic,
        settings,
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      });

      // キャンセルされていなければ完了
      if (!controller.signal.aborted) {
        setVideoBlob(blob);
        setStatus('completed');
        setProgress({
          renderedFrames: mechanic.durationFrames,
          encodedFrames: mechanic.durationFrames,
          totalFrames: mechanic.durationFrames,
          percentComplete: 100,
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // キャンセルされた場合は idle に戻す
        setStatus('idle');
        setProgress(null);
        return;
      }
      setError(err instanceof Error ? err.message : 'レンダリングに失敗しました');
      setStatus('failed');
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const downloadVideo = useCallback((filename: string, container: 'mp4' | 'webm') => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    blobUrlRef.current = url;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${container}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoBlob]);

  return {
    status,
    progress,
    error,
    videoBlob,
    compatibility,
    startRender,
    cancelRender,
    downloadVideo,
    reset,
    checkCompatibility,
  };
}
