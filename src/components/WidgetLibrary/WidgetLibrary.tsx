import { useState } from "react"
import { IconVideo, IconZoomIn } from "@tabler/icons-react"
import { AnimatePresence, motion } from "motion/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../lib/ui"
import { ZoomWidget } from "./_components/ZoomWidget"
import { RecordingWidget } from "./_components/RecordingWidget"

type Tab = "recordings" | "zoom"

const NAV_ITEMS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "recordings", icon: <IconVideo className="size-5" />, label: "Recordings" },
    { id: "zoom", icon: <IconZoomIn className="size-5" />, label: "Zoom" },
]

export const WidgetLibrary = () => {
    const [active, setActive] = useState<Tab>("recordings")

    return (
        <>
            <aside className="w-13.5 h-full border-r border-sf-border">
                <div className="flex flex-col items-center gap-1 pt-2">
                    {NAV_ITEMS.map(({ id, icon, label }) => (
                        <Tooltip key={id} side="bottom">
                            <TooltipTrigger>
                                <button
                                    onClick={() => setActive(id)}
                                    className={`flex items-center justify-center size-9 rounded-md transition-colors cursor-pointer ${active === id
                                        ? "bg-sf-border-lt text-sf-primary"
                                        : "text-sf-secondary hover:bg-sf-border hover:text-sf-primary"
                                        }`}
                                >
                                    {icon}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </aside>

            <div className="w-[260px] h-full border-r border-sf-border relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, }}
                        exit={{ opacity: 0, }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        {active === "recordings" ? <RecordingWidget /> : <ZoomWidget />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    )
}
