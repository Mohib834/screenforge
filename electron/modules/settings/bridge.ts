import { ipcRenderer } from 'electron';
import { CH } from '../../channels';
import type { AppSettings } from '../../../src/types/index';

export const settingsBridge = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(CH.settings.GET),

  saveSettings: (settings: AppSettings): Promise<void> =>
    ipcRenderer.invoke(CH.settings.SAVE, settings),
};
