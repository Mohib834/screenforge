import { IconVideo } from '@tabler/icons-react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { useStore } from '../../../store';
import { useCursorOverlay } from '../../../hooks/useCursorOverlay';

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export const CanvasPreview = ({ videoRef }: Props) => {
  const recordingResult = useStore((s) => s.recordingResult);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCursorOverlay(canvasRef, videoRef, recordingResult);

  return (
    <div className="flex-1 h-full flex items-center justify-center bg-sf-bg overflow-hidden">
      {recordingResult ? (
        <>
          {/* Off-screen video — source of truth for playback controls and frame decoding.
               Must NOT use display:none — Chromium skips frame decoding for hidden elements,
               making ctx.drawImage() produce blank frames. */}
          <video
            ref={videoRef}
            src={`screenforge://local${recordingResult.filePath}`}
            preload="auto"
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          />
          {/* Visible canvas — renders video frame + cursor overlay */}
          <canvas
            ref={canvasRef}
            className="max-h-3/4 max-w-3/4"
            style={{ objectFit: 'contain', display: 'block' }}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 select-none">
          <div className="flex items-center justify-center size-12 rounded-xl bg-sf-panel border border-sf-border">
            <IconVideo size={22} stroke={1.5} className="text-sf-muted" />
          </div>
          <p className="text-sm text-sf-muted">Record your screen to get started</p>
        </div>
      )}
    </div>
  );
};
