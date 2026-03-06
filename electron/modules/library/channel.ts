import { ipcMain } from 'electron';
import { CH } from '../../channels';
import { getLibrary } from './service';

export function registerLibraryChannels(): void {
  ipcMain.handle(CH.library.GET, () => getLibrary());
}
