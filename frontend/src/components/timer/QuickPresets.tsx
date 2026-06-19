'use client';
import { useSessionStore } from '@/store/useSessionStore';

export default function QuickPresets() {
  const { targetMinutes, setSession, status } = useSessionStore();
  const presets = [15, 25, 45, 60, 90];

  if (status !== 'idle') return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {presets.map(mins => (
        <button
          key={mins}
          onClick={() => setSession({ targetMinutes: mins })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            targetMinutes === mins 
              ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50' 
              : 'bg-slate-900/50 text-slate-400 border-emerald-900/30 hover:border-emerald-500/30 hover:text-emerald-300'
          }`}
        >
          {mins} min
        </button>
      ))}
    </div>
  );
}
