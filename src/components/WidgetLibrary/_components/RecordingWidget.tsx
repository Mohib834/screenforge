import { useState } from "react"
import { IconVideoOff } from "@tabler/icons-react"
import { Button } from "../../../lib/ui"

const MOCK_RECORDINGS: { name: string; date: string; size: string; hue: number }[] = [
    { name: "Product Demo", date: "Feb 28", size: "62.4 MB", hue: 220 },
    { name: "Onboarding Flow", date: "Feb 27", size: "28.8 MB", hue: 250 },
]

export const RecordingWidget = () => {
    const [hovered, setHovered] = useState<number | null>(null)

    return (
        <div className="flex flex-col h-full">
            <div className="text-sf-primary tracking-wider flex flex-none my-4 items-center px-4 text-sm font-medium">
                Recordings
            </div>

            <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-3 pb-3">
                {MOCK_RECORDINGS.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16 text-center">
                        <IconVideoOff size={28} stroke={1.5} className="text-sf-muted" />
                        <div className="text-sm font-medium text-sf-secondary">No recordings yet</div>
                        <div className="text-xs text-sf-muted">Hit the button below to start one</div>
                    </div>
                )}
                {MOCK_RECORDINGS.map((rec, i) => (
                    <div
                        key={rec.name}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        className="rounded-md overflow-hidden cursor-pointer border border-sf-border transition-colors shrink-0"
                        style={{
                            borderColor: hovered === i ? "var(--color-sf-border-lt)" : undefined,
                        }}
                    >
                        {/* Thumbnail */}
                        <div
                            className="w-full"
                            style={{
                                aspectRatio: "16/9",
                                background: `radial-gradient(ellipse at 30% 40%, hsla(${rec.hue}, 50%, 20%, 0.6) 0%, #0d0d10 70%)`,
                            }}
                        />

                        {/* Metadata */}
                        <div className="flex items-center justify-between px-2.5 py-2 border-t border-sf-border">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-sf-primary truncate">{rec.name}</div>
                                <div className="text-xs text-sf-secondary mt-0.5">{rec.date}</div>
                            </div>
                            <div className="text-xs text-sf-muted shrink-0 ml-3">{rec.size}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-3 pb-4 border-t border-sf-border pt-3">
                <Button size="sm" className="w-full text-base">
                    Start a new recording
                </Button>
            </div>
        </div>
    )
}
