import { useState, useRef, useCallback } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { MechanicData } from '../../data/types';

export type RecordingStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'completed' | 'failed';

interface RecorderState {
  status: RecordingStatus;
  progress: number;
  error: string | null;
  videoUrl: string | null;
}

interface UsePreviewRecorderReturn extends RecorderState {
  startRecording: (
    playerRef: React.RefObject<PlayerRef | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    mechanic: MechanicData
  ) => Promise<void>;
  cancelRecording: () => void;
  downloadVideo: (filename: string) => void;
  resetRecorder: () => void;
}

/**
 * Browser-based preview recorder using html2canvas and MediaRecorder
 */
export function usePreviewRecorder(): UsePreviewRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const resetRecorder = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setStatus('idle');
    setProgress(0);
    setError(null);
    setVideoUrl(null);
    cancelledRef.current = false;
  }, [videoUrl]);

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setStatus('idle');
    setProgress(0);
  }, []);

  const startRecording = useCallback(async (
    playerRef: React.RefObject<PlayerRef | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    mechanic: MechanicData
  ) => {
    if (!containerRef.current) {
      setError('Player container not found');
      setStatus('failed');
      return;
    }

    cancelledRef.current = false;
    setStatus('preparing');
    setProgress(0);
    setError(null);

    try {
      // Dynamic import html2canvas
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const container = containerRef.current;
      const fps = mechanic.fps;
      const totalFrames = mechanic.durationFrames;
      const frameDelay = 1000 / fps;

      // Create canvas for recording
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Setup MediaRecorder
      const stream = canvas.captureStream(fps);

      // Try different MIME types for compatibility
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error('WebM recording is not supported in this browser');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      const recordingComplete = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          if (cancelledRef.current) {
            reject(new Error('Recording cancelled'));
            return;
          }
          const blob = new Blob(chunksRef.current, { type: mimeType });
          resolve(blob);
        };
        mediaRecorder.onerror = (e) => {
          reject(new Error('MediaRecorder error'));
        };
      });

      // Pause the player before recording
      if (playerRef.current?.pause) {
        playerRef.current.pause();
      }

      setStatus('recording');
      mediaRecorder.start();

      // Render each frame
      for (let frame = 0; frame < totalFrames; frame++) {
        if (cancelledRef.current) {
          break;
        }

        // Seek to frame
        if (playerRef.current?.seekTo) {
          playerRef.current.seekTo(frame);
        }

        // Wait for render (give time for React to update)
        await new Promise(resolve => setTimeout(resolve, 80));

        // Capture the player container
        const capturedCanvas = await html2canvas(container, {
          backgroundColor: '#0a0a1a',
          scale: 1,
          logging: false,
          useCORS: true,
          width: 960,
          height: 540,
          allowTaint: true,
        });

        // Draw to recording canvas
        ctx.drawImage(capturedCanvas, 0, 0, 960, 540);

        // Update progress
        setProgress(Math.round((frame / totalFrames) * 100));

        // Small delay to allow MediaRecorder to process
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      if (cancelledRef.current) {
        setStatus('idle');
        return;
      }

      setStatus('processing');
      mediaRecorder.stop();

      const videoBlob = await recordingComplete;
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      setStatus('completed');
      setProgress(100);

    } catch (err) {
      console.error('Recording error:', err);
      setError(err instanceof Error ? err.message : 'Recording failed');
      setStatus('failed');
    }
  }, []);

  const downloadVideo = useCallback((filename: string) => {
    if (!videoUrl) return;

    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${filename}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl]);

  return {
    status,
    progress,
    error,
    videoUrl,
    startRecording,
    cancelRecording,
    downloadVideo,
    resetRecorder,
  };
}
