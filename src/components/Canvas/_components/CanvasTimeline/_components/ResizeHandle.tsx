import { useState } from 'react';

interface Props {
    onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle = ({ onMouseDown }: Props) => {
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
};
