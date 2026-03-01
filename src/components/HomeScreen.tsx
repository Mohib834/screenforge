import { motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import logoSrc from "../assets/logo.png";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-sf-border px-2 py-0.5 font-sans text-xs flex items-center justify-center text-">
      {children}
    </kbd>
  );
}

export default function HomeScreen() {
  function handleRecord() {
    console.log("Start recording");
  }

  useHotkeys("mod+shift+r", handleRecord, { preventDefault: true });

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-sf-bg">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-accent-glow" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="Screenforge logo"
            className="h-30 w-30 object-contain"
          />
          <span className="text-2xl font-semibold tracking-tight text-sf-primary">
            Screenforge
          </span>

          {/* Subtitle */}
          <p className="text-md text-sf-secondary">
            Beautiful screen recordings, automatically.
          </p>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="flex items-center gap-1.5 text-sf-secondary">
          <Kbd>⌘</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>R</Kbd>
          <span className="ml-1 text-xs">to start recording</span>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-2xs text-sf-muted">
        v0.0.1 — open source
      </p>
    </div>
  );
}
