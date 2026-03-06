import { Button } from "../../lib/ui"


export const ZoomWidget = () => {
    return (
        <div className="px-4">
            <div className="text-sf-primary tracking-wider flex flex-none my-4 items-center  text-sm font-medium">
                Zoom
            </div>
            <Button size="sm" className="w-full text-base">Add zoom</Button>
        </div>
    )
}