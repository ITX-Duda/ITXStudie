'use client';

import { useState } from 'react';
import { Plus, Trash2, BookMarked, GraduationCap, X } from 'lucide-react';

interface Session {
  topicId?: string | null;
  durationMins?: number | null;
  status: string;
}

interface PlanTopic {
  id: string;
  topicId: string;
  order: number;
  topic: {
    id: string;
    name: string;
    category: { name: string };
  };
}

interface QuarterPlan {
  id: string;
  name: string;
  topics: PlanTopic[];
}

interface Props {
  plan: QuarterPlan;
  sessions: Session[];
  allTopics: { id: string; name: string; category: { id: string; name: string } }[];
  onAddTopic: (topicId: string) => void;
  onRemoveTopic: (topicId: string) => void;
}

export default function QuarterPlanCard({
  plan,
  sessions,
  allTopics,
  onAddTopic,
  onRemoveTopic,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const planTopicIds = new Set(plan.topics.map((pt) => pt.topicId));
  const availableTopics = allTopics.filter((t) => !planTopicIds.has(t.id));

  // Hours studied per topic
  const hoursPerTopic = (topicId: string) => {
    const mins = sessions
      .filter((s) => s.topicId === topicId && s.status === 'stopped' && s.durationMins)
      .reduce((acc, s) => acc + (s.durationMins ?? 0), 0);
    return (mins / 60).toFixed(1);
  };

  const totalHours = plan.topics.reduce((acc, pt) => {
    const mins = sessions
      .filter((s) => s.topicId === pt.topicId && s.status === 'stopped' && s.durationMins)
      .reduce((a, s) => a + (s.durationMins ?? 0), 0);
    return acc + mins;
  }, 0) / 60;

  const maxHours = Math.max(
    ...plan.topics.map((pt) => parseFloat(hoursPerTopic(pt.topicId))),
    1,
  );

  const handleAdd = () => {
    if (!selectedTopicId) return;
    onAddTopic(selectedTopicId);
    setSelectedTopicId('');
    setAdding(false);
  };

  return (
    <div className="bg-slate-900/30 border border-emerald-900/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-emerald-900/30 text-emerald-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">
              {plan.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalHours.toFixed(1)}h estudadas · {plan.topics.length} tópicos
            </p>
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar tópico
        </button>
      </div>

      {/* Add topic inline */}
      {adding && (
        <div className="flex gap-2 mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-600"
          >
            <option value="">Selecionar tópico…</option>
            {availableTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.category.name} › {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTopicId}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-40 transition-colors"
          >
            Adicionar
          </button>
          <button
            onClick={() => setAdding(false)}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Topic list */}
      {plan.topics.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          Nenhum tópico adicionado ao trimestre ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {plan.topics.map((pt, idx) => {
            const hrs = parseFloat(hoursPerTopic(pt.topicId));
            const pct = Math.min((hrs / maxHours) * 100, 100);

            return (
              <div key={pt.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono w-4">{idx + 1}</span>
                    <BookMarked className="w-3.5 h-3.5 text-emerald-500/60" />
                    <div>
                      <span className="text-sm text-slate-200">{pt.topic.name}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        {pt.topic.category.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-400 text-sm">{hrs}h</span>
                    <button
                      onClick={() => onRemoveTopic(pt.topicId)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="ml-6 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
