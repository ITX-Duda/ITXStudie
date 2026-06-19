'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import CircleRunner from '@/components/circles/CircleRunner';
import { useCircleStore, CirclePhase, CircleRun } from '@/store/useCircleStore';
import { getRun } from '@/lib/api';
import { CheckCircle2, Layers, RefreshCw } from 'lucide-react';

export default function CircleRunPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params?.id as string;

  const { activeCircle, activeRun, currentPhase, activeSession, setCircleRun, updateAfterAdvance, resetCircle } =
    useCircleStore();

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // If the store doesn't have an active run (e.g., page refresh),
  // try to reload from the URL — this requires a runId which we don't have here.
  // For now we redirect back to /circles if no run is in store.
  useEffect(() => {
    if (!activeRun || activeRun.circleId !== circleId) {
      router.replace('/circles');
    }
  }, [activeRun, circleId, router]);

  const handleUpdate = (run: CircleRun, phase: CirclePhase | null, session: { id: string; startTime: string } | null) => {
    if (activeCircle) {
      updateAfterAdvance(run, phase, session);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      resetCircle();
      router.push('/circles');
    }, 3000);
  };

  if (!activeCircle || !activeRun || !currentPhase) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Redirecting...
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="p-5 rounded-full bg-emerald-900/30 text-emerald-400">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Circle Complete! 🎉</h2>
          <p className="text-slate-400 mt-2">You completed all phases of <span className="text-emerald-400">{activeCircle.name}</span>.</p>
          <p className="text-slate-500 text-sm mt-4">Returning to Circles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-8 text-slate-500 text-sm">
          <Layers className="w-4 h-4" />
          <span>Running: <span className="text-slate-300">{activeCircle.name}</span></span>
        </div>

        <CircleRunner
          circle={activeCircle}
          run={activeRun}
          currentPhase={currentPhase}
          activeSession={activeSession}
          onUpdate={handleUpdate}
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
}
