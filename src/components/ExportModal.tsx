import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconX } from '@tabler/icons-react';
import { Button, IconButton } from '../lib/ui';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [resolution, setResolution] = useState('1080p');
  const [format, setFormat] = useState('MP4');
  const [folder, setFolder] = useState('~/Movies/Screenforge');

  const selectCls =
    'w-full rounded bg-sf-bg border border-sf-border text-sf-primary text-sm px-2 py-[5px] outline-none cursor-pointer focus:border-sf-border-lt';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-[400px] rounded-xl border border-sf-border bg-sf-panel p-6 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-md font-semibold text-sf-primary">Export Recording</h2>
              <IconButton variant="ghost" size="xs" onClick={onClose}>
                <IconX size={14} stroke={2} />
              </IconButton>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-sf-secondary">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className={selectCls}
                >
                  <option value="1080p">1080p — 60fps</option>
                  <option value="4K">4K — 60fps</option>
                  <option value="720p">720p — 30fps</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-sf-secondary">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className={selectCls}
                >
                  <option value="MP4">MP4 (H.264)</option>
                  <option value="WebM">WebM</option>
                  <option value="MOV">MOV</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-sf-secondary">Output Folder</label>
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full rounded border border-sf-border bg-sf-bg px-2 py-[5px] text-sm text-sf-primary outline-none transition-colors focus:border-sf-border-lt"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm">Export</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
