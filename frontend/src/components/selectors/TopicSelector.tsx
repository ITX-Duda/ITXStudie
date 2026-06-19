'use client';
import { useSessionStore } from '@/store/useSessionStore';

interface TopicSelectorProps {
  topics: any[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function TopicSelector({ topics, selectedId, onChange }: TopicSelectorProps) {
  const { status } = useSessionStore();
  if (status !== 'idle') return null;

  return (
    <div>
      <label className="block text-xs text-slate-400 uppercase mb-2">Select Topic</label>
      <select 
        value={selectedId} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-900/50 border border-emerald-900/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="">-- No Topic --</option>
        {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </div>
  );
}
