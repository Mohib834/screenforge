import type { PreloadProgress } from '../types/index';
import logoSrc from '../assets/logo.png';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsub = window.screenforge.onPreloadProgress((p: PreloadProgress) => {
      setProgress((p.completed / p.total) * 100);
    });
    return unsub;
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-sf-bg">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-accent-glow" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center justify-center">
          <img src={logoSrc} alt="Screenforge logo" className="h-30 w-30 object-contain" />
          <span className="text-2xl font-semibold tracking-tight text-sf-primary">Screenforge</span>

          {/* Subtitle */}
          <p className="text-md text-sf-secondary">Beautiful screen recordings, automatically.</p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-5 text-2xs text-sf-muted">v0.0.1</p>

      {/* Loading bar — 2px, full width, flush to bottom edge */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sf-border">
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%`, backgroundColor: '#5b6af7' }}
        />
      </div>
    </div>
  );
}
