'use client';
import { useSessionStore } from '@/store/useSessionStore';

interface CategorySelectorProps {
  categories: any[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function CategorySelector({ categories, selectedId, onChange }: CategorySelectorProps) {
  const { status } = useSessionStore();
  if (status !== 'idle') return null;

  return (
    <div>
      <label className="block text-xs text-slate-400 uppercase mb-2">Select Category</label>
      <select 
        value={selectedId} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-900/50 border border-emerald-900/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="">-- No Category --</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );
}
