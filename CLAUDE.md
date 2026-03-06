# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Building an open-source screen recording tool with automatic zoom animations and cursor tracking. Fully local, no server required.

## Commands

```bash
pnpm start        # Start the Electron app in dev mode (Vite + HMR)
pnpm run lint     # Lint with ESLint (ts, tsx files)
pnpm run package  # Package the app for the current platform
pnpm run make     # Build distributable installers
```

> Always use **pnpm** — not npm or yarn.

## Tech Stack

- **Framework**: Electron 40 with Electron Forge
- **Frontend**: React 19 + animate-ui (primary) + shadcn/ui (fallback)
- **Bundler**: Vite via `@electron-forge/plugin-vite`
- **Video Processing**: FFmpeg (runs locally)
- **Language**: TypeScript

## Architecture

Electron runs three separate processes, each with its own entry point:

| File | Process | Role |
|---|---|---|
| `electron/main.ts` | Main | Window management, registers all IPC handlers |
| `electron/preload.ts` | Preload | Merges all bridge slices into `window.screenforge` |
| `src/app.tsx` | Renderer | React app entry point, mounts into `#root` in `index.html` |

Vite builds each process separately using configs:
- `vite.main.config.ts` — main process
- `vite.preload.config.ts` — preload script
- `vite.renderer.config.mts` — renderer (React)

### IPC Structure

All IPC channel name constants live in `electron/channels.ts` — the single source of truth shared by both main and preload.

```
electron/
  channels.ts                   ← shared IPC channel name constants
  main.ts                       ← window management + calls register*() for each feature
  preload.ts                    ← spreads all bridge slices into exposeInMainWorld

  bootstrap/
    startup.ts                  ← orchestrates app startup tasks (FFmpeg check, init all features)
    bridge.ts                   ← onPreloadProgress listener (main → renderer push)

  features/<name>/
    store.ts                    ← owns data: cache, initialize*(), read accessors
    handler.ts                  ← ipcMain side: imports from store, registers ipcMain.handle/on
    bridge.ts                   ← ipcRenderer side: wraps invoke/send using CH constants
```

**Each layer's responsibility:**

| File | Responsibility |
|---|---|
| `store.ts` | Owns data — cache, initialization, read accessors |
| `handler.ts` | Main-process IPC — registers `ipcMain.handle/on`, calls store |
| `bridge.ts` | Preload-process IPC — wraps `ipcRenderer.invoke/send` |
| `preload.ts` | Spreads all `*Bridge` objects into `window.screenforge` — nothing else |
| `main.ts` | Calls all `register*Handlers()` + manages windows — nothing else |
| `channels.ts` | Shared constants between handler and bridge — no Electron imports |

**Rule:** `handler.ts` and `bridge.ts` are never imported by the same process. `handler.ts` uses `ipcMain`, `bridge.ts` uses `ipcRenderer`.

**Adding a new feature (e.g. zoom):**
1. Add zoom channels to `electron/channels.ts`
2. Create `electron/features/zoom/store.ts` — data and initialization
3. Create `electron/features/zoom/handler.ts` — `ipcMain` handlers
4. Create `electron/features/zoom/bridge.ts` — `ipcRenderer` bridge
5. Call `initializeZoom()` in `bootstrap/startup.ts`
6. Call `registerZoomHandlers()` in `electron/main.ts`
7. Spread `...zoomBridge` in `electron/preload.ts`

### Recording Architecture (planned)
- Record screen + log mouse data in memory during recording
- Post-process: analyze mouse data to detect activity hotspots
- Generate zoom keyframes based on mouse activity
- Use Canvas/video compositing to render zoom overlays
- FFmpeg combines original recording + zoom effects into final video

## UI Design

- Linear-inspired dark UI
- **animate-ui** is the primary component library — always check animate-ui first before reaching for shadcn/ui
- If a component does not exist in animate-ui, fall back to shadcn/ui
- Add components via the shadcn CLI (both registries are configured in `components.json`):
  ```bash
  pnpm dlx shadcn@latest add @animate-ui/<component>  # preferred
  pnpm dlx shadcn@latest add @shadcn/<component>       # fallback
  ```
- Three-panel layout: left sidebar (controls), center (preview), right (stats)
- Minimal, clean, tight spacing with sharp edges

## Known Gotchas

- **`vite.renderer.config.mts` must stay `.mts`** — `@vitejs/plugin-react` is ESM-only and cannot be loaded by CommonJS `require`. Renaming it to `.ts` will break the build with an esbuild error.
- **pnpm requires `onlyBuiltDependencies`** — The `package.json` has `"pnpm": { "onlyBuiltDependencies": ["electron"] }` to allow Electron's post-install script to download the binary. Do not remove this.
- **`tsconfig.json` uses `"jsx": "react-jsx"`** — Required for JSX transform without explicit React imports.

## Development Phases

1. ✅ Electron Forge + React + Vite setup
2. ✅ animate-ui + shadcn/ui integration (components.json configured)
3. ⬜ Screen recording capture
4. ⬜ Mouse tracking and activity detection
5. ⬜ Zoom animation logic with easing curves
6. ⬜ FFmpeg video composition
7. ⬜ Polish UI and export flow
