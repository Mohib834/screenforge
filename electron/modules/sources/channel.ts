import { ipcMain } from 'electron';
import { CH } from '../../channels';
import { fetchSources } from './service';

export function registerSourcesChannels(): void {
  ipcMain.handle(CH.sources.GET, () => fetchSources());
}
