import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { PreloadProgress } from '../../../src/types/index';
import log from '../../lib/logger';
import { initializeSettings } from '../settings/service';
import { initializeSources } from '../sources/service';
import { initializeLibrary } from '../library/service';

const execAsync = promisify(exec);

export async function runPreloadTasks(onProgress: (p: PreloadProgress) => void): Promise<void> {
  const total = 4;
  let completed = 0;

  const done = (task: string) => {
    completed++;
    onProgress({ task, completed, total });
  };

  // Settings must finish before library (library needs the output folder path)
  await initializeSettings().then(() => done('Settings Load'));

  await Promise.all([
    checkFFmpeg().then(() => done('FFmpeg Check')),
    initializeLibrary().then(() => done('Library Scan')),
    initializeSources().then(() => done('Sources Init')),
  ]);
}

async function checkFFmpeg(): Promise<void> {
  for (const p of ['/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg']) {
    try {
      await fs.access(p);
      return;
    } catch {
      /* try next */
    }
  }
  try {
    const { stdout } = await execAsync('which ffmpeg');
    log.info('[AppService:checkFFmpeg] FFmpeg found at:', stdout.trim());
  } catch {
    log.warn('[AppService:checkFFmpeg] FFmpeg not found — video export will be unavailable');
  }
}
