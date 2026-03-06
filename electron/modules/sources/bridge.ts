import { ipcRenderer } from 'electron';
import { CH } from '../../channels';
import type { DesktopSource } from '../../../src/types/index';

export const sourcesBridge = {
  getSources: (): Promise<DesktopSource[]> => ipcRenderer.invoke(CH.sources.GET),
};
