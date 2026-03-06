# screenforge

## 0.0.2

### Patch Changes

- ### Added
  - Splash screen with logo, tagline, dot-grid background, accent glow,
    and a 2px bottom progress bar tracking preload steps
  - Floating toolbar — frameless pill-shaped overlay (blur + dark glass)
    anchored to bottom center with source tabs (Display / Window / Area),
    window picker dropdown, Record / Pause / Stop controls with live
    elapsed timer, microphone toggle, animated state transitions via
    Framer Motion, and tooltips on all icon buttons
  - IPC feature modules for app, library, recording, settings, and sources
    — each with bridge.ts, channel.ts, and service.ts; added
    electron/channels.ts as shared constants
  - UI library components: IconButton, Tooltip, DropdownMenu, Button,
    highlight/particles effects, Slot, and custom hooks
    (useControlledState, useDataState, useIsInView)
  - Structured logger at electron/lib/logger.ts
  - Prettier config, MCP config, and shadcn components.json

## 0.0.1

### Patch Changes

- ### Added
  - Electron 40 + React 19 + Vite project scaffold with Electron
    Forge
  - Home screen
  - ⌘ Shift R global keyboard shortcut to trigger recording
  - Custom dark design system (Tailwind CSS v4, sf-\*
    color/spacing tokens)
  - Dot-grid and accent-glow layered background effects
  - Changesets for version and changelog management
