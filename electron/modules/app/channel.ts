import { ipcMain, app } from 'electron';
import { CH } from '../../channels';

export function registerAppChannels(): void {
  ipcMain.on(CH.app.QUIT, () => app.quit());
}
