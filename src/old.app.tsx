import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { IconPlayerRecordFilled, IconPhoto, IconSettings } from '@tabler/icons-react';
import { Button } from './lib/ui';
import RecordView from './components/views/RecordView';
import LibraryView from './components/views/LibraryView';
import SettingsView from './components/views/SettingsView';
import { cn } from './lib/utils';

type View = 'record' | 'library' | 'settings';

const NAV_ITEMS: {
  id: View;
  label: string;
  Icon: React.ComponentType<{ size?: number; stroke?: number }>;
}[] = [
    { id: 'record', label: 'Record', Icon: IconPlayerRecordFilled },
    { id: 'library', label: 'Library', Icon: IconPhoto },
    { id: 'settings', label: 'Settings', Icon: IconSettings },
  ];

export default function App() {
  const [view, setView] = useState<View>('record');

  return (
    <div className="flex h-screen overflow-hidden bg-sf-bg font-sans text-sf-primary">

      {/* app-right: topbar + content + timeline */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex h-11 shrink-0 items-center gap-1 border-b border-sf-border px-4">
          <nav className="flex flex-1 gap-0.5">
            {NAV_ITEMS.map(({ id, label }) => (
              <Button
                key={id}
                variant='ghost'
                onClick={() => setView(id)}
                size='sm'
                className={cn('px-2', view === id ? 'bg-secondary text-sf-primary' : 'text-sf-secondary')}
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Content / views */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'record' && <RecordView key="record" />}
            {view === 'library' && <LibraryView key="library" />}
            {view === 'settings' && <SettingsView key="settings" />}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
