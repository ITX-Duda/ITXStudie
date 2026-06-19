'use client';

import { useState } from 'react';
import { StudyCircle } from '@/store/useCircleStore';
import { Clock, Play, Trash2, BookOpen, Coffee, ChevronDown } from 'lucide-react';
import CycleWheel from './CycleWheel';

interface CircleCardProps {
  circle: StudyCircle;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
}

export default function CircleCard({ circle, onDelete, onStart }: CircleCardProps) {
  const [showWheel, setShowWheel] = useState(false);

  const studyPhases = circle.phases.filter((p) => p.type === 'study');
  const breakPhases = circle.phases.filter((p) => p.type === 'break');
  const totalMins = circle.phases.reduce((acc, p) => acc + p.durationMins, 0);

  return (
    <div className="group relative bg-slate-900/40 border border-slate-700/50 hover:border-emerald-800/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
            {circle.name}
          </h3>
          {circle.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{circle.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(circle.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Phase visual bar */}
      <div className="flex gap-0.5 mb-4 h-2 rounded-full overflow-hidden">
        {circle.phases.map((phase) => (
          <div
            key={phase.id}
            className={`flex-1 ${phase.type === 'study' ? 'bg-emerald-500' : 'bg-slate-500/60'}`}
            title={`${phase.label || (phase.type === 'study' ? 'Study' : 'Break')} – ${phase.durationMins}m`}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          {totalMins} min total
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          {studyPhases.length} focus
        </span>
        <span className="flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-slate-400" />
          {breakPhases.length} breaks
        </span>

        {/* Toggle wheel preview */}
        <button
          onClick={() => setShowWheel((v) => !v)}
          className="ml-auto flex items-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors text-xs"
          title="Preview cycle diagram"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${showWheel ? 'rotate-180' : ''}`}
          />
          Cycle
        </button>
      </div>

      {/* Collapsible cycle wheel preview */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          showWheel ? 'max-h-64 opacity-100 mb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-3 pt-1 pb-2">
          <CycleWheel phases={circle.phases} activeIndex={-1} size={160} />
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Focus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              Break
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onStart(circle.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-700/40 text-emerald-400 font-medium text-sm hover:bg-emerald-600/30 hover:border-emerald-600/60 hover:text-emerald-300 transition-all duration-200"
      >
        <Play className="w-4 h-4 fill-current" />
        Start Circle
      </button>
    </div>
  );
}
