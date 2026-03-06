import { ipcRenderer } from 'electron';
import { CH } from '../../channels';
import type { PreloadProgress } from '../../../src/types/index';

export const appBridge = {
  onPreloadProgress: (cb: (p: PreloadProgress) => void) => {
    const handler = (_: Electron.IpcRendererEvent, p: PreloadProgress) => cb(p);
    ipcRenderer.on(CH.preload.PROGRESS, handler);
    return () => ipcRenderer.removeListener(CH.preload.PROGRESS, handler);
  },

  quitApp: (): void => ipcRenderer.send(CH.app.QUIT),
};
