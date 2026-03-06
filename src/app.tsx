// screenforge app
import { useState } from "react"
import { IconUpload } from "@tabler/icons-react"
import { AppMain } from "./components/AppMain"
import { AppWidgets } from "./components/AppWidgets"
import { Button } from "./lib/ui"
import { AppWidgetConfig } from "./components/AppWidgetConfig"
import type { SelectedZoomAction } from "./types/timeline"

export default function App() {
  const [selectedAction, setSelectedAction] = useState<SelectedZoomAction>(null)

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-sf-bg font-sans text-sf-primary">
      <nav className="relative w-full h-11 flex items-center border-b border-sf-border px-4">
        {/* Center: file name */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="text-sm font-medium text-sf-secondary">Untitled</span>
        </div>

        {/* Right: export */}
        <div className="ml-auto">
          <Button size="sm" className="gap-1.5 py-1">
            <IconUpload />
            Export
          </Button>
        </div>
      </nav>

      <div className="flex w-full h-full overflow-hidden">
        <AppWidgets />
        <AppMain onSelectAction={setSelectedAction} />
        <AppWidgetConfig selectedAction={selectedAction} />
      </div>

    </main>
  )
}
