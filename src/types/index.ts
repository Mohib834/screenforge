// ── Preload progress ──────────────────────────────────────────────────────────
export interface PreloadProgress {
  task: string;
  completed: number;
  total: number;
}

// ── Desktop sources ───────────────────────────────────────────────────────────
export interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string | null;
  appIcon: string | null;
}

// ── Cursor tracking ───────────────────────────────────────────────────────────
export interface CursorEvent {
  x: number;
  y: number;
  type: 'move' | 'click' | 'scroll';
  timestamp: number;
}

// ── Recording result ──────────────────────────────────────────────────────────
export interface RecordingResult {
  filePath: string;
  mouseData: CursorEvent[];
  duration: number;
}

// ── Library ───────────────────────────────────────────────────────────────────
export interface LibraryItem {
  name: string;
  path: string;
  size: number;
  duration: number | null;
  createdAt: string;
}

// ── Settings ──────────────────────────────────────────────────────────────────
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

// ── Preload API ───────────────────────────────────────────────────────────────
export interface ScreenforgeAPI {
  onPreloadProgress: (cb: (p: PreloadProgress) => void) => () => void;
  getSources: () => Promise<DesktopSource[]>;
  startRecording: (sourceId: string) => Promise<void>;
  stopRecording: () => Promise<{ mouseData: CursorEvent[] }>;
  saveRecording: (buffer: ArrayBuffer) => Promise<string>;
  recordingFinished: (data: RecordingResult) => void;
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
