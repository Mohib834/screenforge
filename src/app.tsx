// screenforge app
import { useEffect } from "react"
import { IconDeviceFloppy, IconUpload } from "@tabler/icons-react"
import { WidgetLibrary } from "./components/WidgetLibrary/WidgetLibrary"
import { Button } from "./lib/ui"
import { Inspector } from "./components/Inspector/Inspector"
import { Canvas } from "./components/Canvas/Canvas"
import { useStore } from "./store"

const App = () => {
    const setRecording = useStore(s => s.setRecordingResult)

    useEffect(() => {
        return window.screenforge.onRecordingLoad(setRecording)
    }, [setRecording])

    return (
        <main className="flex flex-col h-screen overflow-hidden bg-sf-bg font-sans text-sf-primary">
            <nav className="relative w-full h-11 flex items-center border-b border-sf-border px-4">
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    <span className="text-sm font-medium text-sf-secondary">Untitled</span>
                </div>

                <div className="flex ml-auto gap-2">
                    <Button variant="secondary" size="sm" className="gap-1.5 py-1">
                        <IconDeviceFloppy />
                        Save
                    </Button>
                    <Button size="sm" className="gap-1.5 py-1">
                        <IconUpload />
                        Export
                    </Button>
                </div>
            </nav>

            <div className="flex w-full h-full overflow-hidden">
                <WidgetLibrary />
                <Canvas />
                <Inspector />
            </div>

        </main>
    )
}

export default App
