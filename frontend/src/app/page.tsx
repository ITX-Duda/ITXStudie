'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Clock,
  BookOpen,
  Zap,
  Trash2,
  Tag,
  BarChart2,
  Plus,
} from 'lucide-react';
import {
  startSession,
  stopSession,
  getSessions,
  deleteSession,
  getCategories,
  getTopics,
  getQuarterPlans,
  createQuarterPlan,
  addTopicToPlan,
  removeTopicFromPlan,
} from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { useSessionStore } from '@/store/useSessionStore';
import { format, formatDistanceToNow } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// UI Components
import Navbar from '@/components/layout/Navbar';
import TimerDisplay from '@/components/timer/TimerDisplay';
import SessionControls from '@/components/timer/SessionControls';
import QuickPresets from '@/components/timer/QuickPresets';
import CategorySelector from '@/components/selectors/CategorySelector';
import TopicSelector from '@/components/selectors/TopicSelector';
import RatingModal from '@/components/session/RatingModal';
import QuarterPlanCard from '@/components/quarter/QuarterPlanCard';

export default function Home() {
  const user = useUserStore((state) => state.user);
  const { status, targetMinutes, activeSessionMeta, setSession, resetSession } =
    useSessionStore();

  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [quarterPlans, setQuarterPlans] = useState<any[]>([]);

  const [catId, setCatId] = useState('');
  const [topId, setTopId] = useState('');

  const [remainingSeconds, setRemainingSeconds] = useState(targetMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Rating modal
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Quarter plan creation
  const [showNewPlanInput, setShowNewPlanInput] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  // ─── Sync timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'idle') {
      setRemainingSeconds(targetMinutes * 60);
    }
  }, [targetMinutes, status]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  useEffect(() => {
    if (catId && user) {
      fetchTopics(catId);
    } else {
      setTopics([]);
      setTopId('');
    }
  }, [catId, user]);

  useEffect(() => {
    if (activeSession) {
      setSession({ status: 'running' });
      const now = new Date();
      const start = new Date(activeSession.startTime);
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      setRemainingSeconds(targetMinutes * 60 - diff);

      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      setSession({ status: 'idle' });
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, targetMinutes, setSession]);

  // ─── Fetchers ───────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const [sessionData, catData, topicData, planData] = await Promise.all([
        getSessions(user!.id),
        getCategories(user!.id),
        getTopics(user!.id),
        getQuarterPlans(user!.id),
      ]);
      const active = sessionData.find((s: any) => s.status === 'running');
      if (active) {
        setActiveSession(active);
        setSession({
          activeSessionMeta: {
            categoryName: active.category?.name ?? null,
            topicName: active.topic?.name ?? null,
          },
        });
      }
      setSessions(sessionData);
      setCategories(catData);
      setAllTopics(topicData);
      setQuarterPlans(planData);
    } catch (e) {
      console.error('Failed to fetch:', e);
    }
  };

  const fetchTopics = async (categoryId: string) => {
    try {
      const data = await getTopics(user!.id, categoryId);
      setTopics(data);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Session handlers ───────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!user) return;
    try {
      const session = await startSession(user.id, catId || undefined, topId || undefined);
      setActiveSession(session);
      const cat = categories.find((c) => c.id === catId);
      const top = topics.find((t) => t.id === topId);
      setSession({
        activeSessionMeta: {
          categoryName: cat?.name ?? null,
          topicName: top?.name ?? null,
        },
      });
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = () => {
    // Show rating modal before stopping
    setShowRatingModal(true);
  };

  const handleRatingConfirm = async (
    notes: string,
    rating: 'productive' | 'unproductive',
  ) => {
    if (!activeSession) return;
    try {
      await stopSession(activeSession.id, { notes, rating });
      setActiveSession(null);
      setSession({ activeSessionMeta: null });
      resetSession();
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setShowRatingModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Quarter plans ──────────────────────────────────────────────────────────
  const handleCreatePlan = async () => {
    if (!user || !newPlanName.trim()) return;
    try {
      const plan = await createQuarterPlan(user.id, newPlanName.trim());
      setQuarterPlans((prev) => [plan, ...prev]);
      setNewPlanName('');
      setShowNewPlanInput(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTopic = async (planId: string, topicId: string) => {
    try {
      await addTopicToPlan(planId, topicId);
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveTopic = async (planId: string, topicId: string) => {
    try {
      await removeTopicFromPlan(planId, topicId);
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Chart data ─────────────────────────────────────────────────────────────
  const barChartData = (() => {
    const map: Record<string, number> = {};
    sessions
      .filter((s) => s.status === 'stopped' && s.durationMins && s.topic)
      .forEach((s) => {
        const name = s.topic.name;
        map[name] = (map[name] ?? 0) + s.durationMins;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, mins]) => ({ name, hours: parseFloat((mins / 60).toFixed(2)) }));
  })();

  const BAR_COLORS = [
    '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
    '#059669', '#047857', '#065f46', '#064e3b',
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-emerald-500/30">
      <Navbar />

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          onConfirm={handleRatingConfirm}
          onCancel={() => setShowRatingModal(false)}
        />
      )}

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* ── Row 1: Timer + History ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Timer */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category/Topic selector (idle only) */}
            {status === 'idle' && (
              <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6 space-y-4">
                <CategorySelector
                  categories={categories}
                  selectedId={catId}
                  onChange={setCatId}
                />
                {catId && topics.length > 0 && (
                  <TopicSelector
                    topics={topics}
                    selectedId={topId}
                    onChange={setTopId}
                  />
                )}
              </div>
            )}

            {/* Active session meta (running only) */}
            {status === 'running' && activeSessionMeta && (
              <div className="bg-emerald-900/10 border border-emerald-700/30 rounded-2xl p-4 space-y-1">
                {activeSessionMeta.categoryName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-400">Categoria:</span>
                    <span className="text-emerald-300 font-medium">
                      {activeSessionMeta.categoryName}
                    </span>
                  </div>
                )}
                {activeSessionMeta.topicName && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-400">Tópico:</span>
                    <span className="text-emerald-300 font-medium">
                      {activeSessionMeta.topicName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Timer */}
            <div>
              <TimerDisplay
                remainingSeconds={remainingSeconds}
                isRunning={status === 'running'}
              />
              <SessionControls
                isRunning={status === 'running'}
                onStart={handleStart}
                onStop={handleStop}
              />
              <QuickPresets />
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-emerald-900/20">
                  <p className="text-slate-400 text-sm mb-1">Total Sessions</p>
                  <p className="text-2xl font-semibold text-white">{sessions.length}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-emerald-900/20">
                  <p className="text-slate-400 text-sm mb-1">Total Hours</p>
                  <p className="text-2xl font-semibold text-white">
                    {(
                      sessions.reduce((acc, s) => acc + (s.durationMins || 0), 0) / 60
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bar Chart */}
            <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6 h-[260px] flex flex-col">
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Horas por Tópico
              </h3>
              <div className="flex-1 min-h-0">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}h`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #064e3b',
                          borderRadius: '8px',
                        }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(v) => [`${Number(v).toFixed(2)}h`, 'Horas']}
                      />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                        {barChartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Complete sessões com tópico para ver o gráfico.
                  </div>
                )}
              </div>
            </div>

            {/* Session History */}
            <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Histórico
              </h3>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {sessions
                  .filter((s) => s.status === 'stopped')
                  .slice(0, 10)
                  .map((session) => {
                    const ratingColor =
                      session.rating === 'productive'
                        ? 'text-emerald-400'
                        : session.rating === 'unproductive'
                        ? 'text-rose-400'
                        : 'text-slate-600';
                    const ratingLabel =
                      session.rating === 'productive'
                        ? '👍'
                        : session.rating === 'unproductive'
                        ? '👎'
                        : '';

                    return (
                      <div
                        key={session.id}
                        className="group flex items-start justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-transparent hover:border-emerald-900/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 mt-0.5 rounded-full bg-emerald-900/30 text-emerald-400 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-slate-200">
                                {session.category?.name ?? 'Sessão livre'}
                              </p>
                              {session.topic && (
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                  {session.topic.name}
                                </span>
                              )}
                              {ratingLabel && (
                                <span className={`text-xs ${ratingColor}`}>
                                  {ratingLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDistanceToNow(new Date(session.startTime), {
                                addSuffix: true,
                              })}
                            </p>
                            {session.notes && (
                              <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                                "{session.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-emerald-400 text-sm">
                            {session.durationMins}min
                          </span>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {sessions.filter((s) => s.status === 'stopped').length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Nenhuma sessão completa ainda. Bora focar!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Quarter Plans ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Plano do Trimestre
            </h2>
            <button
              onClick={() => setShowNewPlanInput(true)}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo plano
            </button>
          </div>

          {/* New plan input */}
          {showNewPlanInput && (
            <div className="flex gap-2 mb-4 p-4 bg-slate-900/30 border border-emerald-900/30 rounded-2xl">
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlan()}
                placeholder="Ex: Q3 2026 — Engenharia"
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-600 placeholder-slate-500"
                autoFocus
              />
              <button
                onClick={handleCreatePlan}
                disabled={!newPlanName.trim()}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-40 transition-colors"
              >
                Criar
              </button>
              <button
                onClick={() => setShowNewPlanInput(false)}
                className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {quarterPlans.length === 0 && !showNewPlanInput ? (
            <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-8 text-center text-slate-500 text-sm">
              Crie um plano de trimestre para organizar seus tópicos de estudo.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quarterPlans.map((plan) => (
                <QuarterPlanCard
                  key={plan.id}
                  plan={plan}
                  sessions={sessions}
                  allTopics={allTopics}
                  onAddTopic={(topicId) => handleAddTopic(plan.id, topicId)}
                  onRemoveTopic={(topicId) => handleRemoveTopic(plan.id, topicId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
