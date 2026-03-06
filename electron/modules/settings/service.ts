import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { AppSettings } from '../../../src/types/index';

let cachedSettings: AppSettings | null = null;

export const DEFAULT_SETTINGS: AppSettings = {
  outputFolder: path.join(app.getPath('videos'), 'Screenforge'),
  defaultResolution: '1080p',
  defaultFormat: 'mp4',
  ffmpegPath: 'auto',
  zoomStrength: 5,
  easeDuration: 400,
  launchAtLogin: false,
  showInMenuBar: true,
};

export async function initializeSettings(): Promise<void> {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    const raw = await fs.readFile(settingsPath, 'utf-8');
    cachedSettings = JSON.parse(raw) as AppSettings;
  } catch {
    cachedSettings = { ...DEFAULT_SETTINGS };
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
}

export const getSettings = (): AppSettings => cachedSettings ?? { ...DEFAULT_SETTINGS };

export async function saveSettings(settings: AppSettings): Promise<void> {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  cachedSettings = settings;
}
