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
- **Frontend**: React 19 + shadcn/ui _(shadcn/ui not yet installed — Phase 1 in progress)_
- **Bundler**: Vite via `@electron-forge/plugin-vite`
- **Video Processing**: FFmpeg (runs locally)
- **Language**: TypeScript

## Architecture

Electron runs three separate processes, each with its own entry point:

| File | Process | Role |
|---|---|---|
| `src/main.ts` | Main | Electron app lifecycle, creates `BrowserWindow` |
| `src/preload.ts` | Preload | Bridge between main and renderer (contextBridge) |
| `src/renderer.tsx` | Renderer | React app entry point, mounts into `#root` in `index.html` |

Vite builds each process separately using configs:
- `vite.main.config.ts` — main process
- `vite.preload.config.ts` — preload script
- `vite.renderer.config.mts` — renderer (React)

### Recording Architecture (planned)
- Record screen + log mouse data in memory during recording
- Post-process: analyze mouse data to detect activity hotspots
- Generate zoom keyframes based on mouse activity
- Use Canvas/video compositing to render zoom overlays
- FFmpeg combines original recording + zoom effects into final video

## UI Design

- Linear-inspired dark UI
- shadcn/ui component library
- Three-panel layout: left sidebar (controls), center (preview), right (stats)
- Minimal, clean, tight spacing with sharp edges

## Known Gotchas

- **`vite.renderer.config.mts` must stay `.mts`** — `@vitejs/plugin-react` is ESM-only and cannot be loaded by CommonJS `require`. Renaming it to `.ts` will break the build with an esbuild error.
- **pnpm requires `onlyBuiltDependencies`** — The `package.json` has `"pnpm": { "onlyBuiltDependencies": ["electron"] }` to allow Electron's post-install script to download the binary. Do not remove this.
- **`tsconfig.json` uses `"jsx": "react-jsx"`** — Required for JSX transform without explicit React imports.

## Development Phases

1. ✅ Electron Forge + React + Vite setup
2. ⬜ shadcn/ui integration
3. ⬜ Screen recording capture
4. ⬜ Mouse tracking and activity detection
5. ⬜ Zoom animation logic with easing curves
6. ⬜ FFmpeg video composition
7. ⬜ Polish UI and export flow
