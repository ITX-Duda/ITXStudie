'use client';

import { useState } from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';
import PhaseList, { PhaseInput } from './PhaseList';
import { createCircle } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';

interface CircleBuilderProps {
  onCreated: (circle: unknown) => void;
}

export default function CircleBuilder({ onCreated }: CircleBuilderProps) {
  const user = useUserStore((s) => s.user);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phases, setPhases] = useState<PhaseInput[]>([
    { order: 1, type: 'study', durationMins: 25, label: 'Focus Block' },
    { order: 2, type: 'break', durationMins: 5, label: 'Short Break' },
    { order: 3, type: 'study', durationMins: 25, label: 'Focus Block' },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalMins = phases.reduce((a, p) => a + p.durationMins, 0);

  const handleSave = async () => {
    if (!user || !name.trim() || phases.length === 0) return;
    setSaving(true);
    try {
      const circle = await createCircle(user.id, name.trim(), description.trim() || undefined, phases);
      onCreated(circle);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setName('');
        setDescription('');
        setPhases([
          { order: 1, type: 'study', durationMins: 25, label: 'Focus Block' },
          { order: 2, type: 'break', durationMins: 5, label: 'Short Break' },
          { order: 3, type: 'study', durationMins: 25, label: 'Focus Block' },
        ]);
      }, 1500);
    } catch (e) {
      console.error('Failed to save circle:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400">
          <Layers className="w-4 h-4" />
        </div>
        <h2 className="text-base font-semibold text-slate-100">New Study Circle</h2>
        <span className="ml-auto text-xs text-slate-500">{totalMins} min total</span>
      </div>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Circle name (e.g. Deep Math Session)"
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-700/60 transition-colors mb-3"
      />

      {/* Description */}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description (optional)"
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-700/60 transition-colors mb-4"
      />

      {/* Phases */}
      <PhaseList phases={phases} onChange={setPhases} />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !name.trim() || phases.length === 0}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
          saved
            ? 'bg-emerald-700/40 border border-emerald-600/50 text-emerald-300'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
      >
        {saved ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Circle Saved!
          </>
        ) : saving ? (
          'Saving...'
        ) : (
          'Save Circle'
        )}
      </button>
    </div>
  );
}
