import type { CursorEvent, CursorType, RecordingArea } from '../types/index';

// ── Normalised event types ────────────────────────────────────────────────────

export interface MoveEvent {
  t: number;   // seconds from recording start
  nx: number;  // 0-1 relative to recording area
  ny: number;
  cursorType: CursorType;
}

export interface ClickEvent {
  t: number;
  nx: number;
  ny: number;
}

export interface Ripple {
  nx: number;
  ny: number;
  createdAt: number; // video time (seconds) when spawned
}

export const RIPPLE_DURATION = 0.45; // seconds

// ── Event pre-processing ──────────────────────────────────────────────────────

export const getMoveEvents = (
  events: CursorEvent[],
  startTime: number,
  area: RecordingArea,
): MoveEvent[] =>
  events
    .filter((e) => e.type === 'move' && e.x !== undefined && e.y !== undefined)
    .map((e) => ({
      t: (e.timestamp - startTime) / 1000,
      nx: ((e.x ?? 0) - area.x) / area.width,
      ny: ((e.y ?? 0) - area.y) / area.height,
      cursorType: e.cursorType ?? 'default',
    }));

export const getClickEvents = (
  events: CursorEvent[],
  startTime: number,
  area: RecordingArea,
): ClickEvent[] =>
  events
    .filter((e) => e.type === 'mousedown' && e.x !== undefined && e.y !== undefined)
    .map((e) => ({
      t: (e.timestamp - startTime) / 1000,
      nx: ((e.x ?? 0) - area.x) / area.width,
      ny: ((e.y ?? 0) - area.y) / area.height,
    }));

// ── Cursor interpolation ──────────────────────────────────────────────────────

/**
 * Binary-search the move events array for the last event at or before time t.
 * Returns the normalised cursor position, linearly interpolated between the
 * two surrounding events.  Snaps (no interpolation) across gaps > 200 ms.
 */
export const interpolateCursor = (
  moveEvents: MoveEvent[],
  t: number,
): { nx: number; ny: number; cursorType: CursorType } | null => {
  if (moveEvents.length === 0) { return null; }

  let lo = 0;
  let hi = moveEvents.length - 1;
  let prev = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (moveEvents[mid].t <= t) { prev = mid; lo = mid + 1; }
    else { hi = mid - 1; }
  }

  if (prev === -1) { return { nx: moveEvents[0].nx, ny: moveEvents[0].ny, cursorType: moveEvents[0].cursorType }; }
  if (prev === moveEvents.length - 1) { return { nx: moveEvents[prev].nx, ny: moveEvents[prev].ny, cursorType: moveEvents[prev].cursorType }; }

  const a = moveEvents[prev];
  const b = moveEvents[prev + 1];
  const gap = b.t - a.t;

  // Snap across jumps (cursor teleport / recording gaps)
  if (gap > 0.2) { return { nx: a.nx, ny: a.ny, cursorType: a.cursorType }; }

  const alpha = (t - a.t) / gap;
  return {
    nx: a.nx + alpha * (b.nx - a.nx),
    ny: a.ny + alpha * (b.ny - a.ny),
    cursorType: a.cursorType, // type from the preceding event
  };
};

// ── Canvas drawing ────────────────────────────────────────────────────────────

function applyShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
}

function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
}

/** macOS arrow cursor — tip at (0, 0). */
function drawDefaultCursor(ctx: CanvasRenderingContext2D, pressed: boolean): void {
  const arrow = new Path2D('M 0 0 L 0 20 L 4 15.5 L 7 22 L 9.5 21 L 6.5 14.5 L 12 14.5 Z');
  applyShadow(ctx);
  ctx.fillStyle = pressed ? '#e0e0e0' : '#ffffff';
  ctx.fill(arrow);
  clearShadow(ctx);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke(arrow);
}

/** Pointing-hand cursor — tip of index finger at (0, 0). */
function drawPointerCursor(ctx: CanvasRenderingContext2D, pressed: boolean): void {
  // Finger points up; hotspot = tip of index finger
  const p = new Path2D();
  // Index finger
  p.moveTo(-2, 0);
  p.lineTo(-2, -14);
  p.quadraticCurveTo(-2, -18, 2, -18);
  p.quadraticCurveTo(6, -18, 6, -14);
  p.lineTo(6, 0);
  // Middle finger
  p.lineTo(6, -12);
  p.quadraticCurveTo(6, -16, 10, -16);
  p.quadraticCurveTo(14, -16, 14, -12);
  p.lineTo(14, 2);
  // Ring finger
  p.lineTo(14, -10);
  p.quadraticCurveTo(14, -14, 18, -14);
  p.quadraticCurveTo(22, -14, 22, -10);
  p.lineTo(22, 4);
  // Palm
  p.lineTo(22, 10);
  p.quadraticCurveTo(22, 16, 12, 18);
  p.lineTo(2, 18);
  p.quadraticCurveTo(-4, 18, -4, 10);
  p.lineTo(-4, 0);
  p.closePath();

  ctx.translate(0, 18); // shift so hotspot (top of index) is at origin
  applyShadow(ctx);
  ctx.fillStyle = pressed ? '#e0e0e0' : '#ffffff';
  ctx.fill(p);
  clearShadow(ctx);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke(p);
}

/** I-beam text cursor — centre at (0, 0). */
function drawTextCursor(ctx: CanvasRenderingContext2D): void {
  const h = 20;
  const serif = 5;
  ctx.translate(0, -h / 2); // centre vertically

  applyShadow(ctx);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Vertical bar
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, h);
  ctx.stroke();
  // Top serif
  ctx.beginPath();
  ctx.moveTo(-serif / 2, 0);
  ctx.lineTo(serif / 2, 0);
  ctx.stroke();
  // Bottom serif
  ctx.beginPath();
  ctx.moveTo(-serif / 2, h);
  ctx.lineTo(serif / 2, h);
  ctx.stroke();
  clearShadow(ctx);
}

/** Crosshair cursor — centre at (0, 0). */
function drawCrosshairCursor(ctx: CanvasRenderingContext2D): void {
  const arm = 12;
  const gap = 3;

  applyShadow(ctx);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Horizontal arms
  ctx.beginPath();
  ctx.moveTo(-arm, 0); ctx.lineTo(-gap, 0);
  ctx.moveTo(gap, 0);  ctx.lineTo(arm, 0);
  // Vertical arms
  ctx.moveTo(0, -arm); ctx.lineTo(0, -gap);
  ctx.moveTo(0, gap);  ctx.lineTo(0, arm);
  ctx.stroke();

  // Centre dot
  clearShadow(ctx);
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

/** Open-hand grab cursor — centre at (0, 0). */
function drawGrabCursor(ctx: CanvasRenderingContext2D, pressed: boolean): void {
  // Simplified open hand using arcs for each finger tip
  const fingers: [number, number, number][] = [
    [-10, -14, 3],
    [-4,  -18, 3],
    [3,   -18, 3],
    [10,  -14, 3],
    [16,  -10, 3],
  ];
  const palmY = 0;

  applyShadow(ctx);
  ctx.fillStyle = pressed ? '#e0e0e0' : '#ffffff';
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';

  // Draw palm as a rounded rect
  const palmPath = new Path2D();
  palmPath.roundRect(-13, palmY, 30, 14, 6);
  ctx.fill(palmPath);

  // Draw each finger as a rounded rectangle
  for (const [fx, fy, r] of fingers) {
    const fingerPath = new Path2D();
    fingerPath.roundRect(fx - r, fy - 6, r * 2, 12, r);
    ctx.fill(fingerPath);
  }

  ctx.stroke(palmPath);
  for (const [fx, fy, r] of fingers) {
    const fingerPath = new Path2D();
    fingerPath.roundRect(fx - r, fy - 6, r * 2, 12, r);
    ctx.stroke(fingerPath);
  }
  clearShadow(ctx);
}

/**
 * Draws the cursor at (cx, cy) in canvas coordinates.
 * `scale` = canvas.height / 1080 — keeps cursor size consistent across resolutions.
 * `pressed` = true while a click ripple is within the first 150 ms.
 */
export const drawCursor = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  pressed: boolean,
  cursorType: CursorType = 'default',
): void => {
  const s = scale * (pressed ? 0.88 : 1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  switch (cursorType) {
    case 'pointer':    drawPointerCursor(ctx, pressed);  break;
    case 'text':       drawTextCursor(ctx);              break;
    case 'crosshair':  drawCrosshairCursor(ctx);         break;
    case 'grab':       drawGrabCursor(ctx, pressed);     break;
    default:           drawDefaultCursor(ctx, pressed);  break;
  }

  ctx.restore();
};

/**
 * Click ripple — expanding ring centred on the cursor hotspot.
 * progress: 0 → 1 over RIPPLE_DURATION seconds.
 */
export const drawRipple = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  progress: number,
): void => {
  const maxRadius = 32 * scale;
  const radius = maxRadius * progress;
  const opacity = (1 - progress) * 0.55;

  ctx.save();
  ctx.beginPath();
  // Offset slightly so the ring centres on the cursor tip area
  ctx.arc(cx + 3 * scale, cy + 11 * scale, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
  ctx.restore();
};
