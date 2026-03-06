---
'screenforge': patch
---

- IPC architecture overhaul: Restructured from
   flat handlers into feature modules (app,
  library, recording, settings, sources) each
  with bridge.ts, channel.ts, and service.ts;
  added electron/channels.ts as shared constants
- Floating toolbar: Full FloatingToolbar
  component with recording controls, source
  selection, settings, and window management
- Splash screen: Added SplashScreen component;
   replaced HomeScreen
- UI library: Added IconButton, Tooltip,
  DropdownMenu (main + primitives), Button,
  highlight/particles effects, Slot, custom
  hooks (useControlledState, useDataState,
  useIsInView)
- Logger: New structured logger at
  electron/lib/logger.ts
- Tooling: Added Prettier config
  (.prettierrc.json, .prettierignore), MCP
  config (.mcp.json), shadcn components.json,
  updated ESLint config
- App entry: Updated src/main.tsx and
  src/app.tsx for new layout and module
  structure
- Splash screen — Full-screen loading view
  with logo, tagline, dot-grid background,
  accent glow, and a 2px bottom progress bar
  tracking preload steps
- Floating toolbar — Frameless pill-shaped
  overlay (blur + dark glass) anchored to the
  bottom center of the screen with:
    - Source tabs: Display / Window / Area
    - Window source picker via dropdown (filters
   out the app itself)
    - Record / Pause / Stop controls with live
  elapsed timer
    - Animated idle ↔ recording state
  transitions via Framer Motion
    - Microphone toggle
    - Tooltips on all icon buttons