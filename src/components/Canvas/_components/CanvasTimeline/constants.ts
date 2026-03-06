import type { TimelineAction } from '@xzdarcy/timeline-engine';

export const DEFAULT_DUR = 60;
export const SCALE = 5;
export const GUTTER_W = 140;
export const LANE_H = 36;
export const TOOLBAR_H = 38;
export const RULER_H = 42;

export const SCALE_STEP = 20;
export const SCALE_MIN = 40;
export const SCALE_MAX = 200;

export const TL_H_DEFAULT = TOOLBAR_H + RULER_H + LANE_H + 120;
export const TL_H_MIN = TOOLBAR_H + RULER_H + LANE_H;
export const TL_H_MAX = 480;

export const EFFECTS = {
  video: { id: 'video', name: 'Video' },
  zoom: { id: 'zoom', name: 'Zoom' },
};

export interface Layer {
    id: string;
    label: string;
    hidden: boolean;
    actions: TimelineAction[];
}

export const INITIAL_LAYERS: Layer[] = [
    {
        id: 'video',
        label: 'Video',
        hidden: false,
        actions: [
            { id: 'video-clip', start: 0, end: DEFAULT_DUR, effectId: 'video', flexible: false, movable: false },
        ],
    },
];
