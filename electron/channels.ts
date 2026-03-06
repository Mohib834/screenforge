/**
 * All IPC channel name constants, grouped by domain.
 * Import this in both main-process handlers and the preload bridge
 * so channel strings are never duplicated or mistyped.
 */
export const CH = {
  sources: {
    GET: 'sources:get',
  },
  recording: {
    START: 'recording:start',
    STOP: 'recording:stop',
    SAVE: 'recording:save',
    FINISHED: 'recording:finished',
    LOAD: 'recording:load',
  },
  settings: {
    GET: 'settings:get',
    SAVE: 'settings:save',
  },
  library: {
    GET: 'library:get',
  },
  preload: {
    PROGRESS: 'preload:progress',
  },
  app: {
    QUIT: 'app:quit',
  },
} as const;
