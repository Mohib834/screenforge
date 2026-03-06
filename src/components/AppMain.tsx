import { AppMainPreview } from "./AppMainPreview"
import { AppMainTimeline } from "./AppMainTimeline"
import type { SelectedZoomAction } from "../types/timeline"

interface Props {
    onSelectAction: (action: SelectedZoomAction) => void
}

export const AppMain = ({ onSelectAction }: Props) => {
    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <AppMainPreview />
            <AppMainTimeline onSelectAction={onSelectAction} />
        </div>
    )
}
