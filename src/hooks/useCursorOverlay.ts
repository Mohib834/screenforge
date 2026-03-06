import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { RecordingResult } from '../types/index';
import {
  getMoveEvents,
  getClickEvents,
  interpolateCursor,
  drawCursor,
  drawRipple,
  RIPPLE_DURATION,
} from '../lib/cursorRenderer';
import type { MoveEvent, ClickEvent, Ripple } from '../lib/cursorRenderer';

/**
 * Drives a <canvas> that renders:
 *   1. The video frame (with no transform for now — zoom slots in here in Phase 2)
 *   2. The animated cursor overlay
 *
 * The <video> element is kept hidden; only the canvas is visible.
 */
export const useCursorOverlay = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  recording: RecordingResult | null,
): void => {
  const moveEventsRef = useRef<MoveEvent[]>([]);
  const clickEventsRef = useRef<ClickEvent[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastTimeRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  // Pre-process events whenever the recording changes
  useEffect(() => {
    if (!recording?.recordingArea || !recording.startTime) {
      moveEventsRef.current = [];
      clickEventsRef.current = [];
      ripplesRef.current = [];
      return;
    }
    moveEventsRef.current = getMoveEvents(
      recording.mouseData,
      recording.startTime,
      recording.recordingArea,
    );
    clickEventsRef.current = getClickEvents(
      recording.mouseData,
      recording.startTime,
      recording.recordingArea,
    );
    ripplesRef.current = [];
    lastTimeRef.current = -1;
  }, [recording]);

  // Size the canvas to match the video's native resolution
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { return; }

    const onMetadata = (): void => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 800;
    };

    if (video.readyState >= 1) {
      onMetadata();
    } else {
      video.addEventListener('loadedmetadata', onMetadata, { once: true });
    }

    return () => video.removeEventListener('loadedmetadata', onMetadata);
  }, [canvasRef, videoRef, recording]);

  // RAF draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) { return; }

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    const draw = (): void => {
      rafRef.current = requestAnimationFrame(draw);

      // Skip if no decoded data available yet
      if (video.readyState < 2 || video.videoWidth === 0) { return; }

      const t = video.currentTime;
      const w = canvas.width;
      const h = canvas.height;

      // ── 1. Video frame (Phase 2: replace with zoom-transformed drawImage) ──
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);

      const scale = h / 1080;

      // ── 2. Spawn ripples for clicks that became current this frame ──────────
      const clicks = clickEventsRef.current;
      const prevT = lastTimeRef.current;
      for (const click of clicks) {
        if (click.t > prevT && click.t <= t) {
          ripplesRef.current.push({ nx: click.nx, ny: click.ny, createdAt: click.t });
        }
      }
      lastTimeRef.current = t;

      // ── 3. Draw + cull ripples ───────────────────────────────────────────────
      ripplesRef.current = ripplesRef.current.filter((r) => {
        const progress = (t - r.createdAt) / RIPPLE_DURATION;
        if (progress > 1 || progress < 0) { return false; }
        drawRipple(ctx, r.nx * w, r.ny * h, scale, progress);
        return true;
      });

      // ── 4. Cursor ────────────────────────────────────────────────────────────
      const pos = interpolateCursor(moveEventsRef.current, t);
      if (pos) {
        const pressed = ripplesRef.current.some(
          (r) => t - r.createdAt < 0.15,
        );
        drawCursor(ctx, pos.nx * w, pos.ny * h, scale, pressed, pos.cursorType);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); }
    };
  }, [canvasRef, videoRef, recording]);
};
