import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      // Tell Vite NOT to bundle this module
      external: ['uiohook-napi', 'electron'],
    },
  },
});
