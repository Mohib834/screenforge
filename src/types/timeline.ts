// ── Selected action ───────────────────────────────────────────────────────────

export type SelectedZoomAction = {
    id: string;
    start: number;
    end: number;
    effectId: string;
} | null;

// ── Clip config types ─────────────────────────────────────────────────────────

export interface ZoomConfig {
    scale: number;       // 1.5 | 2 | 2.5 | 3
    strength: number;    // 1–10
    easeDuration: number; // 100–800ms
}

export type ClipConfig = ZoomConfig;

export function defaultClipConfig(effectId: string): ClipConfig {
    switch (effectId) {
        case "zoom":
        default:
            return { scale: 2, strength: 5, easeDuration: 400 };
    }
}

// ── Clip metadata ─────────────────────────────────────────────────────────────

export const CLIP_DEFS: Record<string, { label: string }> = {
    zoom:  { label: "Zoom"  },
    video: { label: "Video" },
};
