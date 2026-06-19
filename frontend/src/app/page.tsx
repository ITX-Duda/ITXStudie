'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, Clock, BookOpen, ChevronRight, Zap } from 'lucide-react';
import { startSession, stopSession, getSessions, getCategories, getTopics } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { useSessionStore } from '@/store/useSessionStore';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// UI Components
import Navbar from '@/components/layout/Navbar';
import TimerDisplay from '@/components/timer/TimerDisplay';
import SessionControls from '@/components/timer/SessionControls';
import QuickPresets from '@/components/timer/QuickPresets';
import CategorySelector from '@/components/selectors/CategorySelector';
import TopicSelector from '@/components/selectors/TopicSelector';

export default function Home() {
  const user = useUserStore(state => state.user);
  const { status, targetMinutes, setSession, resetSession } = useSessionStore();
  
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  // Local state for dropdowns
  const [catId, setCatId] = useState('');
  const [topId, setTopId] = useState('');

  const [remainingSeconds, setRemainingSeconds] = useState(targetMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep targetMinutes and remainingSeconds synced when idle
  useEffect(() => {
    if (status === 'idle') {
      setRemainingSeconds(targetMinutes * 60);
    }
  }, [targetMinutes, status]);

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchCategories();
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
      setRemainingSeconds((targetMinutes * 60) - diff);

      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else {
      setSession({ status: 'idle' });
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, targetMinutes, setSession]);

  const fetchSessions = async () => {
    try {
      const data = await getSessions(user!.id);
      const active = data.find((s: any) => s.status === 'running');
      if (active) setActiveSession(active);
      setSessions(data);
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories(user!.id);
      setCategories(data);
    } catch (e) {
      console.error(e);
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

  const handleStart = async () => {
    if (!user) return;
    try {
      const session = await startSession(user.id, catId || undefined, topId || undefined);
      setActiveSession(session);
      fetchSessions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try {
      await stopSession(activeSession.id);
      setActiveSession(null);
      resetSession();
      fetchSessions();
    } catch (e) {
      console.error(e);
    }
  };

  const chartData = sessions
    .filter(s => s.status === 'stopped' && s.durationMins != null)
    .reverse()
    .map(s => ({
      date: format(new Date(s.startTime), 'MMM dd'),
      duration: s.durationMins,
    }))
    .slice(-7);

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-emerald-500/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Timer & Controls */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Selectors Component */}
          {status === 'idle' && (
             <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6 space-y-4">
              <CategorySelector categories={categories} selectedId={catId} onChange={setCatId} />
              {catId && topics.length > 0 && (
                <TopicSelector topics={topics} selectedId={topId} onChange={setTopId} />
              )}
             </div>
          )}

          {/* Core Timer Components */}
          <div>
            <TimerDisplay remainingSeconds={remainingSeconds} isRunning={status === 'running'} />
            <SessionControls isRunning={status === 'running'} onStart={handleStart} onStop={handleStop} />
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
                <p className="text-slate-400 text-sm mb-1">Total Minutes</p>
                <p className="text-2xl font-semibold text-white">
                  {sessions.reduce((acc, s) => acc + (s.durationMins || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History & Charts */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6 h-[300px] flex flex-col">
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Focus Trend (Last 7 Sessions)
            </h3>
            <div className="flex-1 min-h-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #064e3b', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Not enough data to display trend.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Recent History
            </h3>
            <div className="space-y-3">
              {sessions.filter(s => s.status === 'stopped').slice(0, 5).map(session => {
                const cat = categories.find(c => c.id === session.categoryId);
                return (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-transparent hover:border-emerald-900/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-900/30 text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        {cat ? cat.name : 'Deep Work Session'}
                      </p>
                      <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-emerald-400">{session.durationMins} min</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              )})}
              {sessions.filter(s => s.status === 'stopped').length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No completed sessions yet. Start focusing!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
