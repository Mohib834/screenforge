import { app, screen } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { CursorEvent } from '../../../src/types/index';

let cursorEvents: CursorEvent[] = [];
let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function saveRecording(buffer: ArrayBuffer): Promise<string> {
  const tempPath = path.join(app.getPath('temp'), `screenforge-${Date.now()}.webm`);
  await fs.writeFile(tempPath, Buffer.from(buffer));
  return tempPath;
}

export function startMouseTracking(): void {
  cursorEvents = [];
  pollInterval = setInterval(() => {
    const { x, y } = screen.getCursorScreenPoint();
    cursorEvents.push({ x, y, type: 'move', timestamp: Date.now() });
  }, 16);
}

export function stopMouseTracking(): CursorEvent[] {
  if (pollInterval !== null) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  return cursorEvents;
}
