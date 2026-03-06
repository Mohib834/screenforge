import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled, IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import { Button } from '../../../../../lib/ui';
import { formatTime } from '../../../../../lib/utils';
import { TOOLBAR_H, SCALE_MIN, SCALE_MAX } from '../constants';

interface Props {
    playing: boolean;
    currentTime: number;
    totalDur: number;
    scaleWidth: number;
    onTogglePlay: () => void;
    onStop: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

export const TimelineToolbar = ({ playing, currentTime, totalDur, scaleWidth, onTogglePlay, onStop, onZoomIn, onZoomOut }: Props) => {
    return (
        <div className="flex shrink-0 items-center border-b border-sf-border bg-sf-panel px-3"
            style={{ height: TOOLBAR_H }}
        >
            <div className="flex-1" />

            <div className="flex items-center gap-1">
                <Button variant='ghost' size='icon-sm' onClick={onTogglePlay} title={playing ? 'Pause' : 'Play'}>
                    {playing ? <IconPlayerPauseFilled size={14} /> : <IconPlayerPlayFilled size={14} />}
                </Button>
                <Button variant='ghost' size='icon-sm' onClick={onStop} title="Stop">
                    <IconPlayerStopFilled size={14} />
                </Button>
                <span className="font-mono tabular-nums ml-2" style={{ fontSize: 11, color: 'var(--color-sf-secondary)', letterSpacing: '0.04em' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{formatTime(currentTime)}</span>
                    {' / '}
                    {formatTime(totalDur)}
                </span>
            </div>

            <div className="flex-1 flex items-center justify-end gap-1">
                <Button variant='ghost' size='icon-sm' onClick={onZoomOut} title="Zoom out" active={scaleWidth <= SCALE_MIN}>
                    <IconZoomOut size={14} />
                </Button>
                <div className="text-[10px] font-mono tabular-nums w-8 text-center" style={{ color: 'var(--color-sf-muted)' }}>
                    {Math.round((scaleWidth / 80) * 100)}%
                </div>
                <Button variant='ghost' size="icon-sm" onClick={onZoomIn} title="Zoom in" active={scaleWidth >= SCALE_MAX}>
                    <IconZoomIn size={14} />
                </Button>
            </div>
        </div>
    );
};
