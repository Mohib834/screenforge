import { useState } from 'react';
import { IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '../../../../../lib/ui';
import { GUTTER_W, RULER_H, LANE_H } from '../constants';
import type { Layer } from '../constants';

interface Props {
    layers: Layer[];
    onToggleHidden: (id: string) => void;
    onDeleteLayer: (id: string) => void;
    onRenameLayer: (id: string, label: string) => void;
}

export const TimelineGutter = ({ layers, onToggleHidden, onDeleteLayer, onRenameLayer }: Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    return (
        <div className="shrink-0 flex flex-col border-r border-sf-border bg-sf-panel" style={{ width: GUTTER_W }}>
            <div className="shrink-0 border-b border-sf-border" style={{ height: RULER_H, background: '#0d0d0f' }} />

            {layers.map((row, i) => (
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
                            onBlur={e => { onRenameLayer(row.id, e.target.value.trim() || row.label); setEditingId(null); }}
                            onKeyDown={e => { if (e.key === 'Enter') {(e.target as HTMLInputElement).blur();} if (e.key === 'Escape') {setEditingId(null);} }}
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
                                    onClick={() => onToggleHidden(row.id)}
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
                                    onClick={() => onDeleteLayer(row.id)}
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
    );
};
