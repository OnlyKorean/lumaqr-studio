import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export type ScannerStatus = 'idle' | 'starting' | 'active' | 'denied' | 'unsupported' | 'error';

/**
 * Real in-browser QR scanning with getUserMedia + jsQR.
 * Frames never leave the device. `manual()` decodes an uploaded image
 * (e.g. a screenshot of the QR) as a camera-free test path.
 */
export function useScanner(onResult?: (text: string) => void) {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus((s) => (s === 'active' || s === 'starting' ? 'idle' : s));
  }, []);

  const start = useCallback(async () => {
    setResult(null);
    setManualError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('video element missing');
      video.srcObject = stream;
      await video.play();
      setStatus('active');

      const canvas = document.createElement('canvas');
      const loop = () => {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        const targetW = 480;
        const targetH = Math.round((v.videoHeight / v.videoWidth) * targetW) || 360;
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, targetW, targetH);
        const data = ctx.getImageData(0, 0, targetW, targetH);
        const code = jsQR(data.data, targetW, targetH, { inversionAttempts: 'attemptBoth' });
        if (code) {
          setResult(code.data);
          onResult?.(code.data);
          stop();
        }
      };
      timerRef.current = window.setInterval(loop, 300);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') setStatus('denied');
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') setStatus('unsupported');
      else setStatus('error');
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [onResult, stop]);

  const manual = useCallback(async (file: File) => {
    setManualError(null);
    if (!/^image\//.test(file.type)) {
      setManualError('Choose an image file (PNG, JPG, WebP).');
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('unreadable'));
        i.src = url;
      });
      const max = 1024;
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('no ctx');
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      const code = jsQR(data.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (code) {
        setResult(code.data);
        onResult?.(code.data);
      } else {
        setResult(null);
        setManualError('No QR code detected in that image — try a sharper, larger capture.');
      }
    } catch {
      setManualError('Could not read that image file.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [onResult]);

  useEffect(() => stop, [stop]);

  return { videoRef, status, result, manualError, start, stop, manual };
}
