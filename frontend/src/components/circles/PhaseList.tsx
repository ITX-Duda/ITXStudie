'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, BookOpen, Coffee, ChevronDown } from 'lucide-react';

export interface PhaseInput {
  order: number;
  type: 'study' | 'break';
  durationMins: number;
  label: string;
}

interface PhaseListProps {
  phases: PhaseInput[];
  onChange: (phases: PhaseInput[]) => void;
}

export default function PhaseList({ phases, onChange }: PhaseListProps) {
  const addPhase = (type: 'study' | 'break') => {
    const newPhase: PhaseInput = {
      order: phases.length + 1,
      type,
      durationMins: type === 'study' ? 25 : 5,
      label: type === 'study' ? 'Focus Block' : 'Short Break',
    };
    onChange([...phases, newPhase]);
  };

  const removePhase = (index: number) => {
    const updated = phases
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, order: i + 1 }));
    onChange(updated);
  };

  const movePhase = (index: number, direction: 'up' | 'down') => {
    const updated = [...phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    onChange(updated.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const updatePhase = (index: number, field: keyof PhaseInput, value: string | number) => {
    const updated = [...phases];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const DURATIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90];

  return (
    <div className="space-y-2">
      {phases.map((phase, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            phase.type === 'study'
              ? 'bg-emerald-900/10 border-emerald-800/30'
              : 'bg-slate-800/30 border-slate-700/30'
          }`}
        >
          {/* Type icon */}
          <div
            className={`flex-shrink-0 p-1.5 rounded-lg ${
              phase.type === 'study' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700/40 text-slate-400'
            }`}
          >
            {phase.type === 'study' ? <BookOpen className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
          </div>

          {/* Label */}
          <input
            type="text"
            value={phase.label}
            onChange={(e) => updatePhase(index, 'label', e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 border-none outline-none min-w-0"
            placeholder="Phase label..."
          />

          {/* Duration selector */}
          <div className="relative flex-shrink-0">
            <select
              value={phase.durationMins}
              onChange={(e) => updatePhase(index, 'durationMins', parseInt(e.target.value))}
              className="appearance-none bg-slate-800/60 border border-slate-600/50 text-slate-200 text-xs rounded-lg pl-2.5 pr-6 py-1.5 cursor-pointer focus:outline-none focus:border-emerald-600"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}m
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => movePhase(index, 'up')}
              disabled={index === 0}
              className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => movePhase(index, 'down')}
              disabled={index === phases.length - 1}
              className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removePhase(index)}
              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Add phase buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => addPhase('study')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-emerald-800/50 text-emerald-500/70 text-xs hover:border-emerald-700 hover:text-emerald-400 hover:bg-emerald-900/10 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Focus Block
        </button>
        <button
          onClick={() => addPhase('break')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-700/50 text-slate-500 text-xs hover:border-slate-600 hover:text-slate-400 hover:bg-slate-800/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Break
        </button>
      </div>
    </div>
  );
}
