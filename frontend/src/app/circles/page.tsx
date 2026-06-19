'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, RefreshCw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import CircleCard from '@/components/circles/CircleCard';
import CircleBuilder from '@/components/circles/CircleBuilder';
import { getCircles, deleteCircle, startCircleRun } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { useCircleStore } from '@/store/useCircleStore';
import { StudyCircle } from '@/store/useCircleStore';

export default function CirclesPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const { setCircleRun } = useCircleStore();
  const [circles, setCircles] = useState<StudyCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  const fetchCircles = async () => {
    if (!user) return;
    try {
      const data = await getCircles(user.id);
      setCircles(data);
    } catch (e) {
      console.error('Failed to fetch circles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCircle(id);
      setCircles((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error('Failed to delete circle:', e);
    }
  };

  const handleStart = async (circleId: string) => {
    if (!user) return;
    setStarting(circleId);
    try {
      const result = await startCircleRun(circleId, user.id);
      setCircleRun(
        result.run.circle,
        result.run,
        result.currentPhase,
        result.activeSession,
      );
      router.push(`/circles/${circleId}/run`);
    } catch (e) {
      console.error('Failed to start circle run:', e);
    } finally {
      setStarting(null);
    }
  };

  const totalStudyMins = circles
    .flatMap((c) => c.phases)
    .filter((p) => p.type === 'study')
    .reduce((acc, p) => acc + p.durationMins, 0);

  return (
    <div className="min-h-screen text-slate-200 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-900/30 text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Study Circles</h1>
          </div>
          <p className="text-slate-400 ml-14">
            Design structured study flows with focus blocks and breaks — then run them as a single guided session.
          </p>
          {circles.length > 0 && (
            <div className="ml-14 mt-3 flex items-center gap-4 text-sm text-slate-500">
              <span>{circles.length} circles</span>
              <span>·</span>
              <span>{totalStudyMins} total study minutes planned</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Circle list */}
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Loading circles...
              </div>
            ) : circles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/20 border border-dashed border-slate-700/50 rounded-2xl">
                <Layers className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No circles yet</p>
                <p className="text-sm mt-1">Create your first study circle →</p>
              </div>
            ) : (
              circles.map((circle) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  onDelete={handleDelete}
                  onStart={(id) => {
                    if (!starting) handleStart(id);
                  }}
                />
              ))
            )}
          </div>

          {/* Right: Builder */}
          <div className="lg:col-span-5">
            <CircleBuilder onCreated={(circle) => setCircles((prev) => [circle as StudyCircle, ...prev])} />
          </div>
        </div>
      </main>
    </div>
  );
}
