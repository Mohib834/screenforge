import { useEffect, useState } from "react"
import { IconNotes } from "@tabler/icons-react"
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../lib/ui"
import { ZoomConfig, CLIP_DEFS, defaultClipConfig } from "../../types/timeline"
import { useStore } from "../../store"

// ── Zoom config field definitions ─────────────────────────────────────────────

const ZOOM_SCALE_OPTIONS = [
    { value: "1.5", label: "1.5×" },
    { value: "2", label: "2×" },
    { value: "2.5", label: "2.5×" },
    { value: "3", label: "3×" },
]

const ZOOM_NUMBER_FIELDS: { key: keyof ZoomConfig; label: string; min: number; max: number; step: number }[] = [
    { key: "strength", label: "Strength", min: 1, max: 10, step: 1 },
    { key: "easeDuration", label: "Ease (ms)", min: 100, max: 800, step: 50 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export const Inspector = () => {
    const selectedAction = useStore(s => s.selectedClip);
    const [config, setConfig] = useState<ZoomConfig>(defaultClipConfig("zoom") as ZoomConfig)

    useEffect(() => {
        if (selectedAction) { setConfig(defaultClipConfig(selectedAction.effectId) as ZoomConfig) }
    }, [selectedAction?.id])

    const set = (key: keyof ZoomConfig) => (val: string) =>
        setConfig(c => ({ ...c, [key]: Number(val) }))

    if (!selectedAction) {
        return (
            <div className="p-4 ml-auto w-[240px] border-l border-sf-border flex flex-col items-center justify-center gap-2 text-center -mt-20">
                <IconNotes size={48} stroke={1.5} className="text-sf-muted" />
                <div>
                    <p className="text-sm text-sf-secondary">No clip selected</p>
                    <p className="text-xs text-sf-muted">Click a timeline action to edit</p>
                </div>
            </div>
        )
    }

    const clipLabel = CLIP_DEFS[selectedAction.effectId]?.label ?? selectedAction.effectId

    return (
        <div className="p-4 ml-auto w-[240px] border-l border-sf-border">
            <div className="flex flex-col gap-2 tracking-wider">
                <p className="text-xs">{clipLabel}</p>

                <ul className="flex flex-col gap-2">
                    <li className="flex justify-between items-center">
                        <span className="text-sm text-sf-secondary">Scale</span>
                        <Select value={String(config.scale)} onValueChange={v => set("scale")(v)}>
                            <SelectTrigger className="max-w-[128px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ZOOM_SCALE_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </li>

                    {ZOOM_NUMBER_FIELDS.map(f => (
                        <li key={f.key} className="flex justify-between items-center">
                            <span className="text-sm text-sf-secondary">{f.label}</span>
                            <Input
                                className="max-w-[128px]"
                                type="number"
                                min={f.min} max={f.max} step={f.step}
                                value={config[f.key] as number}
                                onChange={e => set(f.key)(e.target.value)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
