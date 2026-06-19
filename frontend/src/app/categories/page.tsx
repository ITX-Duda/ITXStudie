'use client';

import { useState, useEffect } from 'react';
import { getCategories, createCategory } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { Folder, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const user = useUserStore(state => state.user);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories(user!.id);
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !user) return;
    try {
      await createCategory(user.id, newCatName);
      setNewCatName('');
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-emerald-500" />
        </Link>
        <h1 className="text-3xl font-bold tracking-wider text-emerald-400 flex items-center gap-2">
          <Folder className="w-8 h-8" /> Study Categories
        </h1>
      </div>

      <form onSubmit={handleCreate} className="mb-8 flex gap-4">
        <input 
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New Category Name (e.g., Mathematics)"
          className="flex-1 bg-slate-900/50 border border-emerald-900/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors">
          <Plus className="w-5 h-5" /> Add
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <Link href={`/topics?categoryId=${cat.id}`} key={cat.id} className="bg-slate-900/50 border border-emerald-900/30 hover:border-emerald-500/50 p-6 rounded-2xl transition-all hover:-translate-y-1 group">
            <h2 className="text-xl font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">{cat.name}</h2>
            <p className="text-sm text-slate-500 mt-2">Click to view topics</p>
          </Link>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 border border-dashed border-emerald-900/50 rounded-2xl">
            No categories yet. Create your first one above!
          </div>
        )}
      </div>
    </div>
  );
}
