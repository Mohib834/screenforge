import { contextBridge } from 'electron';
import { sourcesBridge } from './modules/sources/bridge';
import { recordingBridge } from './modules/recording/bridge';
import { settingsBridge } from './modules/settings/bridge';
import { libraryBridge } from './modules/library/bridge';
import { appBridge } from './modules/app/bridge';

contextBridge.exposeInMainWorld('screenforge', {
  ...sourcesBridge,
  ...recordingBridge,
  ...settingsBridge,
  ...libraryBridge,
  ...appBridge,
});
