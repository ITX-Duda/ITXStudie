'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CirclePhase, CircleRun, StudyCircle } from '@/store/useCircleStore';
import { advancePhase, abandonRun } from '@/lib/api';
import { BookOpen, Coffee, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CycleWheel from './CycleWheel';

interface CircleRunnerProps {
  circle: StudyCircle;
  run: CircleRun;
  currentPhase: CirclePhase;
  activeSession: { id: string; startTime: string } | null;
  onUpdate: (run: CircleRun, phase: CirclePhase | null, session: { id: string; startTime: string } | null) => void;
  onComplete: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60).toString().padStart(2, '0');
  const s = (Math.abs(seconds) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function CircleRunner({
  circle,
  run,
  currentPhase,
  activeSession,
  onUpdate,
  onComplete,
}: CircleRunnerProps) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState(currentPhase.durationMins * 60);
  const [advancing, setAdvancing] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  const totalPhases = circle.phases.length;
  const currentIndex = circle.phases.findIndex((p) => p.order === currentPhase.order);
  const progressPct = ((currentIndex) / totalPhases) * 100;

  // 0–1 progress within the current phase (for the wheel inner arc)
  const phaseProgress =
    Math.max(0, (currentPhase.durationMins * 60 - remainingSeconds)) /
    (currentPhase.durationMins * 60);

  // Reset timer when phase changes
  useEffect(() => {
    setRemainingSeconds(currentPhase.durationMins * 60);
    setAutoAdvancing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPhase.id]);

  // Auto-advance breaks when timer hits 0
  useEffect(() => {
    if (remainingSeconds <= 0 && currentPhase.type === 'break' && !autoAdvancing) {
      setAutoAdvancing(true);
      if (timerRef.current) clearInterval(timerRef.current);
      autoAdvanceRef.current = setTimeout(() => handleAdvance(), 1500);
    }
  }, [remainingSeconds, currentPhase.type, autoAdvancing]);

  const handleAdvance = useCallback(async () => {
    if (advancing) return;
    setAdvancing(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const result = await advancePhase(run.id);
      if (result.completed) {
        onComplete();
      } else {
        onUpdate(result.run, result.currentPhase, result.activeSession);
      }
    } catch (e) {
      console.error('Failed to advance phase:', e);
    } finally {
      setAdvancing(false);
    }
  }, [advancing, run.id, onUpdate, onComplete]);

  const handleAbandon = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await abandonRun(run.id);
      router.push('/circles');
    } catch (e) {
      console.error('Failed to abandon run:', e);
    }
  };

  const isStudy = currentPhase.type === 'study';
  const timerDone = remainingSeconds <= 0;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Phase progress bar */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Phase {currentIndex + 1} of {totalPhases}</span>
          <span>{circle.name}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct + (1 / totalPhases) * 100}%` }}
          />
        </div>
        {/* Phase dots */}
        <div className="flex gap-1">
          {circle.phases.map((phase, i) => (
            <div
              key={phase.id}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                i < currentIndex
                  ? 'bg-emerald-600'
                  : i === currentIndex
                  ? phase.type === 'study' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Cycle Wheel (live, animated) ── */}
      <div className="relative flex flex-col items-center gap-3">
        {/* Outer glow ring when studying */}
        <div
          className={`rounded-full transition-all duration-700 ${
            isStudy
              ? 'shadow-[0_0_40px_rgba(16,185,129,0.18)]'
              : 'shadow-[0_0_20px_rgba(100,116,139,0.10)]'
          }`}
        >
          <CycleWheel
            phases={circle.phases}
            activeIndex={currentIndex}
            phaseProgress={phaseProgress}
            size={220}
          />
        </div>

        {/* Timer overlaid below the wheel */}
        <div className="flex flex-col items-center -mt-1">
          <div
            className={`text-5xl font-mono font-bold tabular-nums tracking-tight ${
              timerDone ? 'text-amber-400' : isStudy ? 'text-emerald-300' : 'text-slate-300'
            }`}
          >
            {timerDone && !isStudy ? 'Done!' : formatTime(remainingSeconds)}
          </div>
          <div className="text-slate-500 text-sm mt-1">
            {currentPhase.durationMins} min {isStudy ? 'focus' : 'break'}
          </div>
        </div>
      </div>

      {/* Current phase label pill */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
        isStudy
          ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400'
          : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
      }`}>
        {isStudy ? <BookOpen className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
        <span className="text-sm font-medium">
          {currentPhase.label || (isStudy ? 'Focus Block' : 'Break')}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 w-full">
        {isStudy && (
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${
              timerDone
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-emerald-900/20 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30'
            }`}
          >
            {advancing ? (
              'Advancing...'
            ) : currentIndex === totalPhases - 1 ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {timerDone ? 'Complete Circle!' : 'Finish Early'}
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                {timerDone ? 'Start Next Phase' : 'Skip to Next Phase'}
              </>
            )}
          </button>
        )}

        {!isStudy && autoAdvancing && (
          <div className="text-sm text-slate-400 animate-pulse">Auto-advancing to next phase...</div>
        )}

        <button
          onClick={handleAbandon}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Abandon Circle
        </button>
      </div>

      {/* Upcoming phases */}
      {circle.phases.length > 1 && (
        <div className="w-full space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Upcoming</p>
          <div className="space-y-1.5">
            {circle.phases.slice(currentIndex + 1, currentIndex + 4).map((phase) => (
              <div
                key={phase.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/30"
              >
                <div className={`p-1 rounded ${phase.type === 'study' ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {phase.type === 'study' ? <BookOpen className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                </div>
                <span className="text-xs text-slate-400 flex-1">{phase.label || (phase.type === 'study' ? 'Focus' : 'Break')}</span>
                <span className="text-xs text-slate-500">{phase.durationMins}m</span>
              </div>
            ))}
            {circle.phases.length - currentIndex - 1 > 3 && (
              <p className="text-xs text-slate-600 text-center">
                +{circle.phases.length - currentIndex - 4} more phases
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
