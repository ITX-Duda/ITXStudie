'use client';
import { Play, Square } from 'lucide-react';

interface SessionControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function SessionControls({ isRunning, onStart, onStop }: SessionControlsProps) {
  return (
    <div className="flex justify-center mt-[-40px] relative z-10">
      {isRunning ? (
        <button
          onClick={onStop}
          className="flex items-center gap-2 bg-slate-900 hover:bg-red-950 text-red-400 px-8 py-4 rounded-full font-medium transition-all transform active:scale-95 border border-red-500/30 shadow-lg shadow-black/50"
        >
          <Square className="w-5 h-5 fill-current" /> Stop Focus
        </button>
      ) : (
        <button
          onClick={onStart}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-full font-medium transition-all transform active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <Play className="w-5 h-5 fill-current" /> Start Deep Work
        </button>
      )}
    </div>
  );
}
