import { IconZoomIn } from '@tabler/icons-react';
import type React from 'react';

// ── Node types ────────────────────────────────────────────────────────────────

export type NodeType = 'zoom';

// ── Per-type config shapes ────────────────────────────────────────────────────

export interface ZoomConfig {
  strength: number; // 1–10
  easeDuration: number; // 100–800ms
  scale: number; // 1.5 | 2 | 3
}

export type NodeConfig = ZoomConfig;

export function defaultConfig(_type: NodeType): NodeConfig {
  return { strength: 5, easeDuration: 400, scale: 2 };
}

// ── Track / node data ─────────────────────────────────────────────────────────

export interface TrackNode {
  id: string;
  type: NodeType;
  start: number; // 0–1 fraction of total duration
  end: number;
  config: NodeConfig;
}

export interface Track {
  id: string;
  label: string;
  nodes: TrackNode[];
}

// ── Visual definitions ────────────────────────────────────────────────────────

export const NODE_DEFS: Record<
  NodeType,
  {
    label: string;
    desc: string;
    bg: string;
    border: string;
    solidBg: string;
    solidBorder: string;
    Icon: React.ComponentType<{
      size?: number;
      stroke?: number;
      className?: string;
      style?: React.CSSProperties;
    }>;
  }
> = {
  zoom: {
    label: 'Zoom',
    desc: 'Auto-zoom to cursor activity hotspots',
    bg: 'rgba(0,207,232,0.15)',
    border: 'rgba(0,207,232,0.42)',
    solidBg: '#0e7490',
    solidBorder: '#22d3ee',
    Icon: IconZoomIn,
  },
};

export const NODE_TYPES: NodeType[] = ['zoom'];
