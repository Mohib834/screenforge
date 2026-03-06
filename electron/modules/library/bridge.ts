import { ipcRenderer } from 'electron';
import { CH } from '../../channels';
import type { LibraryItem } from '../../../src/types/index';

export const libraryBridge = {
  getLibrary: (): Promise<LibraryItem[]> => ipcRenderer.invoke(CH.library.GET),
};
