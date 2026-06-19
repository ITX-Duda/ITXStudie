'use client';
import { Timer } from 'lucide-react';

interface TimerDisplayProps {
  remainingSeconds: number;
  isRunning: boolean;
}

export default function TimerDisplay({ remainingSeconds, isRunning }: TimerDisplayProps) {
  const formatTime = (totalSeconds: number) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    return `${isNegative ? '-' : ''}${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-900 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-slate-900/50 backdrop-blur-sm border border-emerald-900/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-emerald-500 mb-4">
          <Timer className={`w-12 h-12 ${isRunning ? 'animate-pulse' : 'opacity-50'}`} />
        </div>
        <h2 className={`text-7xl font-light tracking-tighter tabular-nums mb-8 ${remainingSeconds <= 0 ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
          {formatTime(remainingSeconds)}
        </h2>
      </div>
    </div>
  );
}
