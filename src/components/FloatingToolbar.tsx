import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX,
  IconPlayerPauseFilled,
  IconPlayerStopFilled,
  IconMicrophone,
  IconDeviceDesktop,
  IconAppWindow,
  IconCrop,
  IconPlayerRecordFilled,
  IconCheck,
} from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../lib/ui/components/main/tooltip';
import { IconButton } from '../lib/ui/components/main/icon-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../lib/ui/components/main/dropdown-menu';
import type { DesktopSource, CursorEvent } from '../types/index';
import { useGlobalTooltip } from '../lib/ui/components/primitives/tooltip';

type SourceTab = 'display' | 'window' | 'area';
type RecordState = 'idle' | 'recording' | 'paused';

function Divider() {
  return <div className="h-6 w-px bg-sf-border-lt" />;
}

function formatTime(secs: number): string {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function tabCls(active: boolean, disabled = false) {
  return [
    'flex items-center justify-center rounded-full p-2 transition-all outline-none focus:outline-none focus-visible:outline-none',
    active ? 'bg-[#1e1e22] text-sf-primary shadow-sm' : 'text-sf-secondary hover:text-sf-primary',
    disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
  ]
    .filter(Boolean)
    .join(' ');
}

// ── Main toolbar ──────────────────────────────────────────────────────────────

export default function FloatingToolbar() {
  const [tab, setTab] = useState<SourceTab>('display');
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<DesktopSource | null>(null);

  const { hideImmediate } = useGlobalTooltip();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const windowSources = sources
    .filter((s) => s.id.startsWith('window'))
    .filter((s) => !s.name.toLowerCase().includes('screenforge'));

  useEffect(() => {
    window.screenforge.getSources().then(setSources);
  }, []);

  useEffect(() => {
    if (recordState === 'recording') {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordState]);

  useEffect(() => {
    hideImmediate();
  }, [recordState, hideImmediate]);

  const getSourceId = useCallback((): string | null => {
    if (tab === 'display') {
      return selectedSource?.id ?? sources.find((s) => s.id.startsWith('screen'))?.id ?? null;
    }
    if (tab === 'window') return selectedSource?.id ?? null;
    return null;
  }, [tab, selectedSource, sources]);

  async function handleStart() {
    const sourceId = getSourceId();
    if (!sourceId) return;

    await window.screenforge.startRecording(sourceId);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-expect-error Electron-specific constraint
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080,
        },
      },
    });

    streamRef.current = stream;
    chunksRef.current = [];

    const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.start(1000);
    mediaRecorderRef.current = mr;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setRecordState('recording');
  }

  function handlePause() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (recordState === 'recording') {
      mr.pause();
      setRecordState('paused');
    } else {
      mr.resume();
      startTimeRef.current = Date.now() - elapsed * 1000;
      setRecordState('recording');
    }
  }

  async function handleStop() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    const duration = elapsed;
    setRecordState('idle');

    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const { mouseData } = await window.screenforge.stopRecording();
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const buffer = await blob.arrayBuffer();
    const filePath = await window.screenforge.saveRecording(buffer);

    window.screenforge.recordingFinished({
      filePath,
      mouseData: mouseData as CursorEvent[],
      duration,
    });
  }

  function handleTabChange(t: SourceTab) {
    setTab(t);
    if (t !== 'window') setSelectedSource(null);
  }

  const pillVisible = tab === 'window' && !!selectedSource;

  return (
    <div className="flex h-screen w-full items-end justify-center pb-3 bg-transparent">
      <div
        className="relative h-[60px] overflow-hidden rounded-full border border-sf-border-lt bg-[#111113]/90 shadow-2xl"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex h-full w-max items-center px-4">
          <AnimatePresence mode="wait">
            {recordState === 'idle' ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-0"
              >
                {/* Quit */}
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => window.screenforge.quitApp()}
                      className="cursor-pointer rounded-full text-sf-secondary hover:text-sf-primary"
                    >
                      <IconX size={15} stroke={2} />
                    </IconButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quit</p>
                  </TooltipContent>
                </Tooltip>

                <div className="mx-3">
                  <Divider />
                </div>

                {/* Source tabs */}
                <div className="flex items-center gap-0.5 rounded-full bg-sf-bg p-1">
                  <Tooltip side="top">
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleTabChange('display')}
                        className={tabCls(tab === 'display')}
                      >
                        <IconDeviceDesktop size={16} stroke={1.75} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Display</p>
                    </TooltipContent>
                  </Tooltip>

                  <DropdownMenu
                    onOpenChange={(open) => {
                      if (open) window.screenforge.getSources().then(setSources);
                    }}
                  >
                    <Tooltip side="top">
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={() => setTab('window')}
                            className={tabCls(tab === 'window')}
                          >
                            <IconAppWindow size={16} stroke={1.75} />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tab === 'window' && selectedSource ? selectedSource.name : 'Window'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent
                      side="top"
                      sideOffset={10}
                      align="center"
                      className="min-w-[240px] max-h-56 overflow-y-auto rounded-xl border border-sf-border-lt bg-[#111113]/95 p-2 shadow-2xl backdrop-blur-md"
                    >
                      {windowSources.length === 0 ? (
                        <p className="px-2 py-3 text-center text-xs text-sf-muted">
                          No windows found
                        </p>
                      ) : (
                        windowSources.map((src) => (
                          <DropdownMenuItem
                            key={src.id}
                            onSelect={() => {
                              setSelectedSource(src);
                              setTab('window');
                            }}
                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sf-secondary hover:bg-[#1e1e22] hover:text-sf-primary"
                          >
                            {src.appIcon && (
                              <img
                                src={src.appIcon}
                                alt=""
                                className="h-4 w-4 shrink-0 rounded-sm"
                              />
                            )}
                            <span className="flex-1 truncate">{src.name}</span>
                            {selectedSource?.id === src.id && (
                              <IconCheck size={12} className="shrink-0 text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Tooltip side="top">
                    <TooltipTrigger asChild>
                      <button disabled className={tabCls(tab === 'area', true)}>
                        <IconCrop size={16} stroke={1.75} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Area (coming soon)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <motion.div
                  className="overflow-hidden"
                  animate={{
                    maxWidth: pillVisible ? 180 : 0,
                    marginLeft: pillVisible ? 8 : 0,
                  }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                >
                  <AnimatePresence mode="wait">
                    {pillVisible && (
                      <motion.div
                        key={selectedSource!.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          transition: { duration: 0.2, delay: 0.32 },
                        }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1e1e22] px-2.5 py-1 ring-1 ring-white/5"
                      >
                        {selectedSource!.appIcon && (
                          <img
                            src={selectedSource!.appIcon}
                            alt=""
                            className="h-3.5 w-3.5 shrink-0 rounded-sm"
                          />
                        )}
                        <span className="text-xs text-sf-primary">{selectedSource!.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="mx-3">
                  <Divider />
                </div>

                {/* Mic */}
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer rounded-full text-sf-secondary hover:text-sf-primary"
                    >
                      <IconMicrophone size={16} stroke={1.75} />
                    </IconButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>No Mic</p>
                  </TooltipContent>
                </Tooltip>

                <div className="mx-3">
                  <Divider />
                </div>

                {/* Record */}
                <Tooltip side="top">
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleStart}
                      disabled={tab === 'window' && !selectedSource}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#e54d4d] text-white shadow-[0_0_14px_rgba(229,77,77,0.5)] transition-all hover:bg-[#ef5f5f] active:scale-95 disabled:opacity-40"
                    >
                      <IconPlayerRecordFilled size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Record</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ) : (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <div className="relative flex h-7 w-7 items-center justify-center">
                  <div className="absolute h-5 w-5 animate-ping rounded-full bg-[#e54d4d] opacity-25" />
                  <div className="h-3 w-3 rounded-full bg-[#e54d4d]" />
                </div>

                <span className="mx-4 min-w-[42px] font-mono text-base tabular-nums text-sf-primary">
                  {formatTime(elapsed)}
                </span>

                <Divider />

                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={handlePause}
                  className="mx-3 cursor-pointer rounded-full text-sf-secondary hover:text-sf-primary"
                >
                  <IconPlayerPauseFilled size={15} />
                </IconButton>

                <button
                  onClick={handleStop}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#e54d4d] text-white shadow-[0_0_12px_rgba(229,77,77,0.4)] transition-all hover:bg-[#ef5f5f] active:scale-95"
                >
                  <IconPlayerStopFilled size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
