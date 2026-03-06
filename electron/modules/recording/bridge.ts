import { ipcRenderer } from 'electron';
import { CH } from '../../channels';
import type { CursorEvent, RecordingArea, RecordingResult } from '../../../src/types/index';

export const recordingBridge = {
  startRecording: (sourceId: string): Promise<void> =>
    ipcRenderer.invoke(CH.recording.START, sourceId),

  stopRecording: (): Promise<{
    mouseData: CursorEvent[];
    startTime: number;
    recordingArea: RecordingArea;
  }> => ipcRenderer.invoke(CH.recording.STOP),

  saveRecording: (buffer: ArrayBuffer): Promise<string> =>
    ipcRenderer.invoke(CH.recording.SAVE, buffer),

  recordingFinished: (data: RecordingResult): void => ipcRenderer.send(CH.recording.FINISHED, data),

  onRecordingLoad: (cb: (data: RecordingResult) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: RecordingResult) => cb(data);
    ipcRenderer.on(CH.recording.LOAD, handler);
    return () => ipcRenderer.removeListener(CH.recording.LOAD, handler);
  },
};
