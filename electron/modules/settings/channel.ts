import { ipcMain } from 'electron';
import { CH } from '../../channels';
import { getSettings, saveSettings } from './service';
import type { AppSettings } from '../../../src/types/index';

export function registerSettingsChannels(): void {
  ipcMain.handle(CH.settings.GET, () => getSettings());
  ipcMain.handle(CH.settings.SAVE, (_event, settings: AppSettings) => saveSettings(settings));
}
