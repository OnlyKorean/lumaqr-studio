import { useRef, useState } from 'react';
import { CameraOff, CheckCircle2, ImageUp, ScanLine, TriangleAlert, XCircle } from 'lucide-react';
import { useScanner } from '../../hooks/useScanner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cx } from '../../lib/utils';

export function ScanModal({ open, onClose, expected }: { open: boolean; onClose: () => void; expected: string }) {
  const { videoRef, status, result, manualError, start, stop, manual } = useScanner();
  const fileRef = useRef<HTMLInputElement>(null);
  const [manualBusy, setManualBusy] = useState(false);
  const scanning = status === 'starting' || status === 'active';

  const matched = result !== null && result === expected;
  const scanned = result !== null;

  const onManualFile = async (f: File) => {
    setManualBusy(true);
    await manual(f);
    setManualBusy(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        stop();
        onClose();
      }}
      title="Scan Preview"
      subtitle="A real decode test — frames never leave your browser."
      size="md"
      footer={
        scanning ? (
          <Button variant="secondary" size="sm" onClick={stop}>
            Stop camera
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Result */}
        {scanned && (
          <div
            role="status"
            className={cx(
              'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
              matched
                ? 'border-brand-lime/40 bg-brand-lime/10 text-lime-700 dark:text-brand-lime'
                : 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300',
            )}
          >
            {matched ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden /> : <TriangleAlert size={17} className="mt-0.5 shrink-0" aria-hidden />}
            <div className="min-w-0">
              <p className="font-semibold">{matched ? 'Scan successful — content matches your design.' : 'Decoded, but the content differs from this design.'}</p>
              <p className="mt-1 break-all font-mono text-[11px] opacity-80">decoded: {result}</p>
              {!matched && <p className="mt-0.5 break-all font-mono text-[11px] opacity-80">expected: {expected}</p>}
            </div>
          </div>
        )}

        {/* Camera */}
        {!scanned && !scanning && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Point your camera at the QR preview — on this screen, another device, or a printed sheet — to test a
              real scan. If the camera isn&apos;t available, use the image test below.
            </p>
            <Button size="sm" icon={<ScanLine size={14} aria-hidden />} onClick={start}>
              Start camera scan
            </Button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-xl bg-navy-950" style={{ minHeight: scanning ? 220 : undefined }}>
          <video ref={videoRef} muted playsInline className={cx('w-full', !scanning && 'hidden')} aria-label="Camera feed for QR scanning" />
          {scanning && status === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-300">
              <span className="size-5 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" aria-hidden />
              Starting camera…
            </div>
          )}
          {status === 'denied' && (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <CameraOff size={22} className="text-amber-400" aria-hidden />
              <p className="text-sm font-semibold text-slate-100">Camera permission denied</p>
              <p className="max-w-xs text-xs text-slate-400">
                Allow camera access for this site in your browser&apos;s site settings (padlock icon in the address bar), then start again.
                You can still verify a code with the image test below.
              </p>
            </div>
          )}
          {status === 'unsupported' && (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <CameraOff size={22} className="text-slate-400" aria-hidden />
              <p className="text-sm font-semibold text-slate-100">Camera not available here</p>
              <p className="max-w-xs text-xs text-slate-400">
                This browser or context has no camera access (or isn&apos;t served over HTTPS). Use the image test below, or scan on a phone.
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <XCircle size={22} className="text-rose-400" aria-hidden />
              <p className="text-sm font-semibold text-slate-100">Couldn&apos;t start the camera</p>
              <p className="max-w-xs text-xs text-slate-400">Another app may be using it. Close other camera users or use the image test.</p>
            </div>
          )}
          {status === 'active' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span aria-hidden className="size-44 rounded-2xl border-2 border-brand-cyan/70 shadow-[0_0_40px_rgba(34,211,238,0.25)]" />
            </div>
          )}
        </div>

        {/* Manual image test */}
        <div className="rounded-xl border border-dashed border-black/12 p-3.5 dark:border-white/15">
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">Manual test — decode an image</p>
          <p className="mb-2.5 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Screenshot the QR (or a photo of it) and we decode it locally.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            aria-hidden
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onManualFile(f);
              e.target.value = '';
            }}
          />
          <Button variant="secondary" size="sm" loading={manualBusy} icon={<ImageUp size={14} aria-hidden />} onClick={() => fileRef.current?.click()}>
            Choose QR image…
          </Button>
          {manualError && (
            <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              <XCircle size={13} className="mt-0.5 shrink-0" aria-hidden />
              {manualError}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
