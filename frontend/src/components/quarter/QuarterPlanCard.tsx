'use client';

import { useState } from 'react';
import { Plus, Trash2, GraduationCap, X, ChevronDown, ChevronUp } from 'lucide-react';
import { STUDY_CYCLE_STEPS, StudyCycleStep } from '@/components/session/StudyCycleStepSelector';

interface Session {
  topicId?: string | null;
  durationMins?: number | null;
  status: string;
  studyCycleStep?: string | null;
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

// A step is "done" if ≥ 1 session exists for it (study requires ≥ 3)
function isStepDone(sessions: Session[], topicId: string, step: StudyCycleStep): boolean {
  const matching = sessions.filter(
    (s) => s.topicId === topicId && s.status === 'stopped' && s.studyCycleStep === step,
  );
  return step === 'study' ? matching.length >= 3 : matching.length >= 1;
}

function stepCount(sessions: Session[], topicId: string, step: StudyCycleStep): number {
  return sessions.filter(
    (s) => s.topicId === topicId && s.status === 'stopped' && s.studyCycleStep === step,
  ).length;
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
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const planTopicIds = new Set(plan.topics.map((pt) => pt.topicId));
  const availableTopics = allTopics.filter((t) => !planTopicIds.has(t.id));

  const totalHours = plan.topics.reduce((acc, pt) => {
    const mins = sessions
      .filter((s) => s.topicId === pt.topicId && s.status === 'stopped' && s.durationMins)
      .reduce((a, s) => a + (s.durationMins ?? 0), 0);
    return acc + mins;
  }, 0) / 60;

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
          Adicionar
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
            OK
          </button>
          <button onClick={() => setAdding(false)} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
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
          {plan.topics.map((pt) => {
            const isExpanded = expandedTopicId === pt.topicId;
            const doneSteps = STUDY_CYCLE_STEPS.filter((s) =>
              isStepDone(sessions, pt.topicId, s.id),
            ).length;
            const totalMins = sessions
              .filter((s) => s.topicId === pt.topicId && s.status === 'stopped')
              .reduce((a, s) => a + (s.durationMins ?? 0), 0);

            return (
              <div
                key={pt.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
              >
                {/* Topic row */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate">
                          {pt.topic.name}
                        </span>
                        <span className="text-xs text-slate-500 shrink-0">
                          {pt.topic.category.name}
                        </span>
                      </div>
                      {/* Study Cycle mini progress */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {STUDY_CYCLE_STEPS.map((step) => {
                          const done = isStepDone(sessions, pt.topicId, step.id);
                          const count = stepCount(sessions, pt.topicId, step.id);
                          return (
                            <div
                              key={step.id}
                              title={`${step.label}${count > 0 ? ` (${count}x)` : ''}`}
                              className={`
                                flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-all
                                ${done
                                  ? `${step.bgColor} ${step.color} ${step.borderColor} border-opacity-50`
                                  : 'bg-slate-800 text-slate-600 border-slate-700'
                                }
                              `}
                            >
                              <span>{step.emoji}</span>
                              <span>{step.label}</span>
                              {count > 1 && (
                                <span className="opacity-70">×{count}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 text-xs block">
                        {(totalMins / 60).toFixed(1)}h
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {doneSteps}/5 steps
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : pt.topicId)}
                      className="text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemoveTopic(pt.topicId)}
                      className="text-slate-700 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-3 mt-3">Sessões por etapa do Study Cycle:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {STUDY_CYCLE_STEPS.map((step) => {
                        const count = stepCount(sessions, pt.topicId, step.id);
                        const mins = sessions
                          .filter(
                            (s) =>
                              s.topicId === pt.topicId &&
                              s.status === 'stopped' &&
                              s.studyCycleStep === step.id,
                          )
                          .reduce((a, s) => a + (s.durationMins ?? 0), 0);
                        const done = isStepDone(sessions, pt.topicId, step.id);

                        return (
                          <div
                            key={step.id}
                            className={`
                              flex flex-col items-center gap-1 p-3 rounded-xl border text-center
                              ${done
                                ? `${step.bgColor} ${step.borderColor} border-opacity-40`
                                : 'bg-slate-800/40 border-slate-700'
                              }
                            `}
                          >
                            <span className="text-xl">{step.emoji}</span>
                            <span className={`text-[10px] font-semibold ${done ? step.color : 'text-slate-500'}`}>
                              {step.label}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {count === 0 ? '—' : `${count}x · ${mins}min`}
                            </span>
                            {step.id === 'study' && (
                              <span className="text-[9px] text-slate-600">
                                {count}/3 mín.
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
