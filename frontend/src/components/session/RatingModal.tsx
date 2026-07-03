'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, FileText } from 'lucide-react';

interface RatingModalProps {
  onConfirm: (notes: string, rating: 'productive' | 'unproductive') => void;
  onCancel: () => void;
}

export default function RatingModal({ onConfirm, onCancel }: RatingModalProps) {
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<'productive' | 'unproductive' | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(notes, selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-900/40 rounded-2xl p-6 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-1">Como foi a sessão?</h2>
        <p className="text-sm text-slate-400 mb-6">Avalie antes de encerrar</p>

        {/* Rating buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setSelected('productive')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              selected === 'productive'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-emerald-700 hover:text-emerald-400'
            }`}
          >
            <ThumbsUp className="w-7 h-7" />
            <span className="text-sm font-medium">Produtiva</span>
          </button>

          <button
            onClick={() => setSelected('unproductive')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              selected === 'unproductive'
                ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-rose-700 hover:text-rose-400'
            }`}
          >
            <ThumbsDown className="w-7 h-7" />
            <span className="text-sm font-medium">Improdutiva</span>
          </button>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Anotações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que você estudou? Dificuldades, insights..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Encerrar sessão
          </button>
        </div>
      </div>
    </div>
  );
}
