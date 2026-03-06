export interface PreloadProgress {
  task: string;
  completed: number;
  total: number;
}

export interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string | null;
  appIcon: string | null;
}

export type CursorType = 'default' | 'pointer' | 'text' | 'crosshair' | 'grab';

export interface CursorEvent {
  type: 'move' | 'mouseup' | 'mousedown' | 'scroll';
  x?: number;
  y?: number;
  deltaX?: number; // for scroll
  deltaY?: number; // for scroll
  button?: string | number;
  timestamp: number;
  cursorType?: CursorType; // populated by native cursor detection (future)
}

export interface RecordingArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RecordingResult {
  filePath: string;
  mouseData: CursorEvent[];
  duration: number;
  startTime: number;      // Date.now() when recording began — anchor for event timestamps
  recordingArea: RecordingArea; // logical-pixel bounds of the captured display
}

export interface LibraryItem {
  name: string;
  path: string;
  size: number;
  duration: number | null;
  createdAt: string;
}

export interface AppSettings {
  outputFolder: string;
  defaultResolution: '720p' | '1080p' | '4k';
  defaultFormat: 'mp4' | 'mov' | 'webm';
  ffmpegPath: string;
  zoomStrength: number;
  easeDuration: number;
  launchAtLogin: boolean;
  showInMenuBar: boolean;
}

export interface ScreenforgeAPI {
  onPreloadProgress: (cb: (p: PreloadProgress) => void) => () => void;
  getSources: () => Promise<DesktopSource[]>;
  startRecording: (sourceId: string) => Promise<void>;
  stopRecording: () => Promise<{ mouseData: CursorEvent[]; startTime: number; recordingArea: RecordingArea }>;
  saveRecording: (buffer: ArrayBuffer) => Promise<string>;
  recordingFinished: (data: RecordingResult) => void;
  onRecordingLoad: (cb: (data: RecordingResult) => void) => () => void;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  getLibrary: () => Promise<LibraryItem[]>;
  quitApp: () => void;
}

declare global {
  interface Window {
    screenforge: ScreenforgeAPI;
  }
}
