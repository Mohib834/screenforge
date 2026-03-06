import { create } from 'zustand';
import type { RecordingResult } from '../types/index';
import type { SelectedZoomAction } from '../types/timeline';

interface AppStore {
  // State
  recordingResult: RecordingResult | null;
  selectedClip: SelectedZoomAction;

  // Actions
  setRecordingResult: (result: RecordingResult | null) => void;
  setSelectedClip: (action: SelectedZoomAction) => void;
}

export const useStore = create<AppStore>((set) => ({
  recordingResult: null,
  selectedClip: null,

  setRecordingResult: (result) => set({ recordingResult: result }),
  setSelectedClip: (action) => set({ selectedClip: action }),
}));
