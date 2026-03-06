import { Timeline } from '@xzdarcy/react-timeline-editor';
import type { TimelineState } from '@xzdarcy/react-timeline-editor';
import '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css';
import type { TimelineAction } from '@xzdarcy/timeline-engine';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'; // useEffect kept for stopRaf cleanup
import type { RefObject } from 'react';
import { useStore } from '../../../../store';
import { useResizable } from '../../../../hooks/useResizable';
import { DEFAULT_DUR, SCALE, LANE_H, EFFECTS, TL_H_DEFAULT, TL_H_MIN, TL_H_MAX, SCALE_STEP, SCALE_MIN, SCALE_MAX, INITIAL_LAYERS } from './constants';
import type { Layer } from './constants';
import { ActionClip } from './_components/ActionClip';
import { ResizeHandle } from './_components/ResizeHandle';
import { TimelineToolbar } from './_components/TimelineToolbar';
import { TimelineGutter } from './_components/TimelineGutter';

export const CanvasTimeline = ({ videoRef }: {
    videoRef: RefObject<HTMLVideoElement | null>
}) => {
    const duration = useStore(s => s.recordingResult?.duration ?? 0);
    const selectedClipId = useStore(s => s.selectedClip?.id ?? null);
    const setSelectedClip = useStore(s => s.setSelectedClip);

    const totalDur = duration > 0 ? duration : DEFAULT_DUR;
    const timelineRef = useRef<TimelineState>(null);
    const rafRef = useRef<number | null>(null);
    const { height: tlHeight, onMouseDown: handleResizeMouseDown } = useResizable({ min: TL_H_MIN, max: TL_H_MAX, initial: TL_H_DEFAULT });

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [scaleWidth, setScaleWidth] = useState(80);
    const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);

    const editorData = useMemo(
        () => layers
            .filter(l => !l.hidden)
            .map(({ id, actions }) => ({
                id,
                actions: id === 'video'
                    ? actions.map(a => a.id === 'video-clip' ? { ...a, end: totalDur } : a)
                    : actions,
            })),
        [layers, totalDur]
    );

    const startRaf = useCallback(() => {
        const tick = () => {
            const vid = videoRef.current;

            if (vid) {
                const t = vid.currentTime;
                setCurrentTime(t);
                timelineRef.current?.setTime(t);
                if (vid.ended) {
                    setPlaying(false);
                    rafRef.current = null;
                    return;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }, [videoRef]);

    const stopRaf = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    useEffect(() => () => stopRaf(), [stopRaf]);

    const togglePlay = useCallback(() => {
        if (playing) {
            stopRaf();
            videoRef.current?.pause();
            setPlaying(false);
        } else {
            const vid = videoRef.current;
            if (!vid) {
                return;
            }
            const doPlay = () => {
                vid.play().catch(Object);
                setPlaying(true);
                startRaf();
            };
            if (vid.seeking) {
                vid.addEventListener('seeked', doPlay, { once: true });
            } else {
                doPlay();
            }
        }
    }, [playing, videoRef, startRaf, stopRaf]);

    const handleStop = useCallback(() => {
        stopRaf();
        setPlaying(false);
        setCurrentTime(0);

        timelineRef.current?.setTime(0);

        const vid = videoRef.current;
        if (vid) {
            vid.pause();
            vid.currentTime = 0;
        }
    }, [videoRef, stopRaf]);

    const deleteLayer = (id: string) => setLayers(ls => ls.filter(l => l.id !== id));
    const toggleHidden = (id: string) => setLayers(ls => ls.map(l => l.id === id ? { ...l, hidden: !l.hidden } : l));
    const renameLayer = (id: string, label: string) => setLayers(ls => ls.map(l => l.id === id ? { ...l, label } : l));

    const deleteClip = useCallback((actionId: string) => {
        setLayers(ls => ls.map(l => ({
            ...l,
            actions: l.actions.filter(a => a.id !== actionId)
        })));

        setSelectedClip(null);
    }, [setSelectedClip]);

    const selectClip = useCallback((action: TimelineAction) => {
        setSelectedClip({
            id: action.id,
            start: action.start,
            end: action.end,
            effectId: action.effectId
        });
    }, [setSelectedClip]);

    const seekTo = useCallback((time: number) => {
        const clamped = Math.max(0, Math.min(totalDur, time));

        console.info('clamped', clamped);

        setCurrentTime(clamped);
        timelineRef.current?.setTime(clamped);
        if (videoRef.current) {
            videoRef.current.currentTime = clamped;
        }
    }, [totalDur, videoRef]);

    return (
        <div className="flex flex-col shrink-0 select-none border-t border-sf-border sf-timeline-wrapper"
            style={{ height: tlHeight, background: '#0d0d0f' }}
        >
            <ResizeHandle onMouseDown={handleResizeMouseDown} />

            <TimelineToolbar
                playing={playing}
                currentTime={currentTime}
                totalDur={totalDur}
                scaleWidth={scaleWidth}
                onTogglePlay={togglePlay}
                onStop={handleStop}
                onZoomIn={() => setScaleWidth(w => Math.min(SCALE_MAX, w + SCALE_STEP))}
                onZoomOut={() => setScaleWidth(w => Math.max(SCALE_MIN, w - SCALE_STEP))}
            />

            <div className="flex flex-1 overflow-hidden">
                <TimelineGutter
                    layers={layers}
                    onToggleHidden={toggleHidden}
                    onDeleteLayer={deleteLayer}
                    onRenameLayer={renameLayer}
                />

                <div className="relative flex-1 w-full">
                    <Timeline
                        ref={timelineRef}
                        editorData={editorData}
                        effects={EFFECTS}
                        style={{ height: '100%', width: '100%', background: '#0d0d0f' }}
                        scale={SCALE}
                        scaleWidth={scaleWidth}
                        startLeft={20}
                        minScaleCount={Math.ceil(totalDur / SCALE) + 1}
                        maxScaleCount={Math.ceil(totalDur / SCALE) + 1}
                        rowHeight={LANE_H}
                        autoScroll={true}
                        dragLine
                        scaleSplitCount={5}
                        getScaleRender={(scale) => (
                            <span style={{ fontSize: 9, color: 'var(--color-sf-secondary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                {scale < 60
                                    ? `${scale}s`
                                    : `${Math.floor(scale / 60)}:${String(scale % 60).padStart(2, '0')}`
                                }
                            </span>
                        )}
                        getActionRender={(action) => (
                            <ActionClip
                                action={action}
                                onDelete={deleteClip}
                                onSelect={selectClip}
                                onSeek={seekTo}
                                selected={action.id === selectedClipId}
                            />
                        )}
                        onCursorDrag={(time) => {
                            setCurrentTime(time);
                            if (videoRef.current) {
                                videoRef.current.currentTime = time;
                            }
                        }}
                        onCursorDragEnd={(time) => {
                            setCurrentTime(time);
                            if (videoRef.current) {
                                videoRef.current.currentTime = time;
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
