import fs from 'node:fs/promises';
import path from 'node:path';
import type { LibraryItem } from '../../../src/types/index';
import { getSettings } from '../settings/service';

let cachedLibrary: LibraryItem[] = [];

export async function initializeLibrary(): Promise<void> {
  const folder = getSettings().outputFolder;
  try {
    await fs.mkdir(folder, { recursive: true });
    const entries = await fs.readdir(folder);
    const videoFiles = entries.filter((f) =>
      ['.mp4', '.mov', '.webm'].some((ext) => f.endsWith(ext)),
    );
    cachedLibrary = await Promise.all(
      videoFiles.map(async (name): Promise<LibraryItem> => {
        const filePath = path.join(folder, name);
        const stat = await fs.stat(filePath);
        return {
          name,
          path: filePath,
          size: stat.size,
          duration: null,
          createdAt: stat.birthtime.toISOString(),
        };
      }),
    );
  } catch {
    cachedLibrary = [];
  }
}

export const getLibrary = (): LibraryItem[] => cachedLibrary;
