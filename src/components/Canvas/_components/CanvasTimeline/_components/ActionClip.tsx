import { useState } from 'react';
import { IconZoomIn, IconVideo, IconX } from '@tabler/icons-react';
import type { TimelineAction } from '@xzdarcy/timeline-engine';
import { Button } from '../../../../../lib/ui';

interface Props {
    action: TimelineAction;
    onDelete: (id: string) => void;
    onSelect: (action: TimelineAction) => void;
    onSeek: (time: number) => void;
    selected: boolean;
}

export const ActionClip = ({ action, onDelete, onSelect, onSeek, selected }: Props) => {
    const isVideo = action.effectId === 'video';
    const [hovered, setHovered] = useState(false);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        const getTime = (clientX: number) => {
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            return action.start + ratio * (action.end - action.start);
        };

        onSeek(getTime(e.clientX));

        const onMove = (ev: MouseEvent) => onSeek(getTime(ev.clientX));
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseDown={isVideo ? handleSeek : undefined}
            onClick={isVideo ? undefined : () => onSelect(action)}
            className={`cursor-default relative h-full w-full overflow-hidden flex items-center gap-1.5 pl-2.5 ${isVideo ? 'rounded-l-[3px]' : 'rounded-[3px]'}`}
            style={{
                background: isVideo ? '#1a1a1f' : selected ? '#0891b2' : '#0e7490',
                border: `1px solid ${isVideo ? 'var(--color-sf-border-lt)' : selected ? '#67e8f9' : '#22d3ee'}`,
                boxShadow: selected ? '0 0 0 2px rgba(103, 232, 249, 0.3)' : undefined,
            }}
        >
            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 7px, rgba(255,255,255,0.03) 7px, rgba(255,255,255,0.03) 8px)',
            }} />
            <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

            {isVideo
                ? <IconVideo size={14} style={{ opacity: 0.45, position: 'relative', zIndex: 1, flexShrink: 0 }} />
                : <IconZoomIn size={14} style={{ opacity: 0.9, position: 'relative', zIndex: 1, flexShrink: 0 }} />
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
};
