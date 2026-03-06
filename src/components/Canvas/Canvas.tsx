import { useRef } from "react"
import { CanvasPreview } from "./_components/CanvasPreview"
import { CanvasTimeline } from "./_components/CanvasTimeline"

export const Canvas = () => {
    const videoRef = useRef<HTMLVideoElement>(null)

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <CanvasPreview videoRef={videoRef} />
            <CanvasTimeline videoRef={videoRef} />
        </div>
    )
}
