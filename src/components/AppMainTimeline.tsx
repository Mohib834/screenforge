import { Timeline } from '@xzdarcy/react-timeline-editor';
import type { TimelineState } from '@xzdarcy/react-timeline-editor';
import '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css';
import type { TimelineAction, TimelineRow } from '@xzdarcy/timeline-engine';
import {
    IconEye, IconEyeOff, IconTrash, IconPlayerPlayFilled, IconPlayerPauseFilled,
    IconPlayerStopFilled, IconZoomIn, IconZoomOut, IconVideo, IconX,
} from '@tabler/icons-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '../lib/ui';
import type { SelectedZoomAction } from '../types/timeline';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOTAL_DUR = 60;
const SCALE = 5;
const GUTTER_W = 140;
const LANE_H = 36;
const TOOLBAR_H = 38;
const RULER_H = 42;

const SCALE_STEP = 20;
const SCALE_MIN = 40;
const SCALE_MAX = 200;

const TL_H_DEFAULT = TOOLBAR_H + RULER_H + LANE_H * 2 + 120;
const TL_H_MIN = TOOLBAR_H + RULER_H + LANE_H * 2;
const TL_H_MAX = 480;

// ── Static data ────────────────────────────────────────────────────────────────

const INITIAL_ROWS = [
    { id: 'video', label: 'L1', hidden: false },
    { id: 'zoom', label: 'L2', hidden: false },
];

const INITIAL_DATA: TimelineRow[] = [
    {
        id: 'video',
        actions: [
            { id: 'video-clip', start: 0, end: TOTAL_DUR, effectId: 'video', flexible: false, movable: false },
        ],
    },
    {
        id: 'zoom',
        actions: [
            { id: 'zoom-1', start: 8, end: 22, effectId: 'zoom', flexible: true, movable: true },
            { id: 'zoom-2', start: 35, end: 50, effectId: 'zoom', flexible: true, movable: true },
        ],
    },
];

const EFFECTS = {
    video: { id: 'video', name: 'Video' },
    zoom: { id: 'zoom', name: 'Zoom' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(s: number) {
    const secs = Math.floor(s);
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const sec = String(secs % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

// ── Action clip ────────────────────────────────────────────────────────────────

function ActionClip({ action, onDelete, onSelect, selected }: {
    action: TimelineAction;
    onDelete: (id: string) => void;
    onSelect: (action: TimelineAction) => void;
    selected: boolean;
}) {
    const isVideo = action.effectId === 'video';
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => !isVideo && onSelect(action)}
            style={{
                height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden',
                display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 10,
                position: 'relative',
                background: isVideo ? '#1a1a1f' : selected ? '#0891b2' : '#0e7490',
                border: `1px solid ${isVideo ? 'var(--color-sf-border-lt)' : selected ? '#67e8f9' : '#22d3ee'}`,
                cursor: isVideo ? 'default' : 'pointer',
                boxShadow: selected ? '0 0 0 2px rgba(103, 232, 249, 0.3)' : undefined,
            }}
        >
            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 7px, rgba(255,255,255,0.03) 7px, rgba(255,255,255,0.03) 8px)',
            }} />
            <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

            {isVideo
                ? <IconVideo size={13} stroke={1.5} style={{ opacity: 0.45, position: 'relative', zIndex: 1, flexShrink: 0 }} />
                : <IconZoomIn size={13} stroke={1.5} style={{ opacity: 0.9, position: 'relative', zIndex: 1, flexShrink: 0 }} />
            }
            <span className="relative z-10 flex-1 truncate font-medium" style={{ fontSize: 11, letterSpacing: '0.3px', opacity: isVideo ? 0.35 : 0.9 }}>
                {isVideo ? 'Video' : 'Zoom'}
            </span>

            {!isVideo && hovered && (
                <Button
                    variant='ghost'
                    size='icon-xs'
                    className="relative z-10 mr-1.5 shrink-0 size-4 opacity-60 hover:opacity-100 hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); onDelete(action.id); }}
                >
                    <IconX size={10} stroke={2.5} />
                </Button>
            )}
        </div>
    );
}

// ── Resize handle ─────────────────────────────────────────────────────────────

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="shrink-0 relative"
            style={{
                height: 5, cursor: 'ns-resize',
                background: hovered ? 'var(--color-primary)' : 'var(--color-sf-border)',
                transition: 'background 0.15s',
            }}
        >
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 32, height: 2, borderRadius: 2,
                background: hovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                transition: 'background 0.15s',
            }} />
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export const AppMainTimeline = ({ onSelectAction }: { onSelectAction: (action: SelectedZoomAction) => void }) => {
    const timelineRef = useRef<TimelineState>(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [scaleWidth, setScaleWidth] = useState(80);
    const [rows, setRows] = useState(INITIAL_ROWS);
    const [editorData, setEditorData] = useState<TimelineRow[]>(INITIAL_DATA);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tlHeight, setTlHeight] = useState(TL_H_DEFAULT);
    const tlHeightRef = useRef(TL_H_DEFAULT);
    const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startH = tlHeightRef.current;
        const onMove = (ev: MouseEvent) => {
            const newH = Math.max(TL_H_MIN, Math.min(TL_H_MAX, startH - (ev.clientY - startY)));
            tlHeightRef.current = newH;
            setTlHeight(newH);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    useEffect(() => {
        const ref = timelineRef.current;
        if (!ref) return;
        const onTick = ({ time }: { time: number }) => setCurrentTime(time);
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onEnd = () => setPlaying(false);
        ref.listener.on('setTimeByTick', onTick);
        ref.listener.on('play', onPlay);
        ref.listener.on('paused', onPause);
        ref.listener.on('ended', onEnd);
        return () => {
            ref.listener.off('setTimeByTick', onTick);
            ref.listener.off('play', onPlay);
            ref.listener.off('paused', onPause);
            ref.listener.off('ended', onEnd);
        };
    }, []);

    const togglePlay = useCallback(() => {
        if (playing) timelineRef.current?.pause();
        else timelineRef.current?.play({ autoEnd: true });
    }, [playing]);

    const handleStop = useCallback(() => {
        timelineRef.current?.pause();
        timelineRef.current?.setTime(0);
        setPlaying(false);
        setCurrentTime(0);
    }, []);

    const zoomIn = () => setScaleWidth(w => Math.min(SCALE_MAX, w + SCALE_STEP));
    const zoomOut = () => setScaleWidth(w => Math.max(SCALE_MIN, w - SCALE_STEP));

    const deleteRow = (id: string) => {
        setRows(rs => rs.filter(r => r.id !== id));
        setEditorData(d => d.filter(r => r.id !== id));
    };

    const toggleHidden = (id: string) => setRows(rs => rs.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));

    const renameRow = (id: string, label: string) => setRows(rs => rs.map(r => r.id === id ? { ...r, label } : r));

    const deleteAction = useCallback((actionId: string) => {
        setEditorData(d => d.map(row => ({ ...row, actions: row.actions.filter(a => a.id !== actionId) })));
        setSelectedActionId(id => id === actionId ? null : id);
        onSelectAction(null);
    }, [onSelectAction]);

    const handleSelectAction = useCallback((action: TimelineAction) => {
        setSelectedActionId(action.id);
        onSelectAction({ id: action.id, start: action.start, end: action.end, effectId: action.effectId });
    }, [onSelectAction]);

    const getActionRender = useCallback(
        (action: TimelineAction) => (
            <ActionClip
                action={action}
                onDelete={deleteAction}
                onSelect={handleSelectAction}
                selected={action.id === selectedActionId}
            />
        ),
        [deleteAction, handleSelectAction, selectedActionId],
    );

    const visibleData = editorData.filter(d => {
        const row = rows.find(r => r.id === d.id);
        return row && !row.hidden;
    });

    return (
        <div className="shrink-0 select-none border-t border-sf-border sf-timeline-wrapper"
            style={{ height: tlHeight, display: 'flex', flexDirection: 'column', background: '#0d0d0f' }}
        >
            <ResizeHandle onMouseDown={handleResizeMouseDown} />

            {/* ── Toolbar ── */}
            <div className="flex shrink-0 items-center border-b border-sf-border bg-sf-panel px-3"
                style={{ height: TOOLBAR_H }}
            >
                <div className="flex-1" />

                <div className="flex items-center gap-1">
                    <Button variant='ghost' size='icon-sm' onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
                        {playing ? <IconPlayerPauseFilled size={14} /> : <IconPlayerPlayFilled size={14} />}
                    </Button>
                    <Button variant='ghost' size='icon-sm' onClick={handleStop} title="Stop">
                        <IconPlayerStopFilled size={14} />
                    </Button>
                    <span className="font-mono tabular-nums ml-2" style={{ fontSize: 11, color: 'var(--color-sf-secondary)', letterSpacing: '0.04em' }}>
                        <span style={{ color: 'var(--color-primary)' }}>{formatTime(currentTime)}</span>
                        {' / '}
                        {formatTime(TOTAL_DUR)}
                    </span>
                </div>

                <div className="flex-1 flex items-center justify-end gap-1">
                    <Button variant='ghost' size='icon-sm' onClick={zoomOut} title="Zoom out" active={scaleWidth <= SCALE_MIN}>
                        <IconZoomOut size={14} />
                    </Button>
                    <div className="text-[10px] font-mono tabular-nums w-8 text-center" style={{ color: 'var(--color-sf-muted)' }}>
                        {Math.round((scaleWidth / 80) * 100)}%
                    </div>
                    <Button variant='ghost' size="icon-sm" onClick={zoomIn} title="Zoom in" active={scaleWidth >= SCALE_MAX}>
                        <IconZoomIn size={14} />
                    </Button>
                </div>
            </div>

            {/* ── Gutter + Timeline ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Gutter */}
                <div className="shrink-0 flex flex-col border-r border-sf-border bg-sf-panel" style={{ width: GUTTER_W }}>
                    <div className="shrink-0 border-b border-sf-border" style={{ height: RULER_H, background: '#0d0d0f' }} />
                    {rows.map((row, i) => (
                        <div key={row.id}
                            className="group flex shrink-0 items-center gap-1.5 border-b border-sf-border"
                            style={{ height: LANE_H, padding: '0 8px 0 10px', opacity: row.hidden ? 0.4 : 1, transition: 'opacity 0.15s' }}
                        >
                            <span className="shrink-0 rounded text-[10px] bg-secondary text-sf-primary font-bold"
                                style={{ padding: '2px 5px', letterSpacing: '0.5px' }}
                            >
                                {`L${i + 1}`}
                            </span>

                            {editingId === row.id ? (
                                <input
                                    autoFocus
                                    defaultValue={row.label}
                                    className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-sf-primary outline-none"
                                    style={{ borderBottom: '1px solid var(--color-sf-border-lt)' }}
                                    onBlur={e => { renameRow(row.id, e.target.value.trim() || row.label); setEditingId(null); }}
                                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingId(null); }}
                                />
                            ) : (
                                <span
                                    className="min-w-0 flex-1 truncate text-[11px] font-medium text-sf-secondary cursor-text"
                                    onDoubleClick={() => setEditingId(row.id)}
                                    title="Double-click to rename"
                                >
                                    {row.label}
                                </span>
                            )}

                            <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip side="top">
                                    <TooltipTrigger>
                                        <Button
                                            variant='ghost' size='icon-xs'
                                            className="size-5"
                                            active={row.hidden}
                                            onClick={() => toggleHidden(row.id)}
                                        >
                                            {row.hidden
                                                ? <IconEyeOff size={12} stroke={1.75} />
                                                : <IconEye size={12} stroke={1.75} />
                                            }
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{row.hidden ? 'Show layer' : 'Hide layer'}</TooltipContent>
                                </Tooltip>

                                <Tooltip side="top">
                                    <TooltipTrigger>
                                        <Button
                                            variant='ghost' size='icon-xs'
                                            className="size-5 hover:text-sf-red"
                                            onClick={() => deleteRow(row.id)}
                                        >
                                            <IconTrash size={12} stroke={1.75} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete layer</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative flex-1 overflow-hidden">
                    <Timeline
                        ref={timelineRef}
                        editorData={visibleData}
                        effects={EFFECTS}
                        style={{ height: '100%', width: '100%', background: '#0d0d0f' }}
                        scale={SCALE}
                        scaleWidth={scaleWidth}
                        startLeft={20}
                        minScaleCount={TOTAL_DUR / SCALE}
                        maxScaleCount={TOTAL_DUR / SCALE}
                        rowHeight={LANE_H}
                        scaleSplitCount={5}
                        getActionRender={getActionRender}
                        onCursorDrag={setCurrentTime}
                        onCursorDragEnd={setCurrentTime}
                    />
                </div>
            </div>
        </div>
    );
};
