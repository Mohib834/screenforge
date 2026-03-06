import { ipcMain } from 'electron';
import { CH } from '../../channels';
import { saveRecording, startMouseTracking, stopMouseTracking } from './service';

export function registerRecordingChannels(): void {
  ipcMain.handle(CH.recording.START, (_event, _sourceId: string) => {
    startMouseTracking();
  });

  ipcMain.handle(CH.recording.STOP, () => {
    const { events, startTime, recordingArea } = stopMouseTracking();
    return { mouseData: events, startTime, recordingArea };
  });

  ipcMain.handle(CH.recording.SAVE, (_event, buffer: ArrayBuffer) => saveRecording(buffer));
}
