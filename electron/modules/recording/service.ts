import { app, screen } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { uIOhook } from 'uiohook-napi'; // Standard named import for this library
import type { CursorEvent, RecordingArea } from '../../../src/types/index';

let cursorEvents: CursorEvent[] = [];
let pollInterval: ReturnType<typeof setInterval> | null = null;
let recordingStartTime = 0;
let recordingArea: RecordingArea = { x: 0, y: 0, width: 0, height: 0 };
let lastX = -1;
let lastY = -1;

export async function saveRecording(buffer: ArrayBuffer): Promise<string> {
  const tempPath = path.join(app.getPath('temp'), `screenforge-${Date.now()}.webm`);
  await fs.writeFile(tempPath, Buffer.from(buffer));
  return tempPath;
}

/**
 * Helper to get the current mouse state for events that don't
 * always provide reliable X/Y coordinates (like wheel).
 */
const getCurrentPosition = () => screen.getCursorScreenPoint();

export function startMouseTracking(): void {
  cursorEvents = [];
  lastX = -1;
  lastY = -1;
  recordingStartTime = Date.now();
  recordingArea = screen.getPrimaryDisplay().bounds;

  // 1. Position Polling (Moves)
  // We keep this at 16ms to sync perfectly with 60fps video
  pollInterval = setInterval(() => {
    const { x, y } = getCurrentPosition();
    if (x === lastX && y === lastY) { return; }

    lastX = x;
    lastY = y;

    cursorEvents.push({
      type: 'move',
      x,
      y,
      timestamp: Date.now(),
    });
  }, 16);

  // 2. Click Listeners
  uIOhook.on('mousedown', (event) => {
    cursorEvents.push({
      type: 'mousedown',
      x: event.x,
      y: event.y,
      button: event.button as any,
      timestamp: Date.now(),
    });
  });

  uIOhook.on('mouseup', (event) => {
    cursorEvents.push({
      type: 'mouseup',
      x: event.x,
      y: event.y,
      button: event.button as any,
      timestamp: Date.now(),
    });
  });

  // 3. Scroll Listener
  // Note: uiohook-napi uses 'wheel' as the event name
  uIOhook.on('wheel', (event) => {
    const { x, y } = getCurrentPosition();
    cursorEvents.push({
      type: 'scroll',
      x, // Including position so you know WHERE they scrolled
      y,
      deltaX: 0,
      deltaY: event.rotation, // 'rotation' is the scroll amount
      timestamp: Date.now(),
    });
  });

  // Start the native hook
  uIOhook.start();
}

export function stopMouseTracking(): { events: CursorEvent[]; startTime: number; recordingArea: RecordingArea } {
  if (pollInterval !== null) {
    clearInterval(pollInterval);
    pollInterval = null;
  }

  uIOhook.stop();
  uIOhook.removeAllListeners();

  return { events: cursorEvents, startTime: recordingStartTime, recordingArea };
}
