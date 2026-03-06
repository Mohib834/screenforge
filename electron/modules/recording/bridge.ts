import { ipcRenderer } from 'electron';
import { CH } from '../../channels';
import type { CursorEvent, RecordingResult } from '../../../src/types/index';

export const recordingBridge = {
  startRecording: (sourceId: string): Promise<void> =>
    ipcRenderer.invoke(CH.recording.START, sourceId),

  stopRecording: (): Promise<{ mouseData: CursorEvent[] }> => ipcRenderer.invoke(CH.recording.STOP),

  saveRecording: (buffer: ArrayBuffer): Promise<string> =>
    ipcRenderer.invoke(CH.recording.SAVE, buffer),

  recordingFinished: (data: RecordingResult): void => ipcRenderer.send(CH.recording.FINISHED, data),
};
