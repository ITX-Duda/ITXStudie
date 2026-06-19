'use client';

import { useState, useEffect, Suspense } from 'react';
import { getTopics, createTopic, getCategories } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { BookOpen, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function TopicsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || undefined;
  
  const user = useUserStore(state => state.user);
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(categoryId || '');

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchTopics();
    }
  }, [user, categoryId]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories(user!.id);
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopics = async () => {
    try {
      const data = await getTopics(user!.id, categoryId);
      setTopics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedCatId || !user) return;
    try {
      await createTopic(user.id, selectedCatId, newTopicName);
      setNewTopicName('');
      fetchTopics();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/categories" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-emerald-500" />
        </Link>
        <h1 className="text-3xl font-bold tracking-wider text-emerald-400 flex items-center gap-2">
          <BookOpen className="w-8 h-8" /> Study Topics
        </h1>
      </div>

      <form onSubmit={handleCreate} className="mb-8 flex flex-col md:flex-row gap-4">
        <select 
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
          className="bg-slate-900/50 border border-emerald-900/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          required
        >
          <option value="" disabled>Select Category...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input 
          type="text"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          placeholder="New Topic Name (e.g., React Hooks)"
          className="flex-1 bg-slate-900/50 border border-emerald-900/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          required
        />
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors">
          <Plus className="w-5 h-5" /> Add Topic
        </button>
      </form>

      <div className="space-y-4">
        {topics.map(topic => (
          <div key={topic.id} className="bg-slate-900/50 border border-emerald-900/30 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/30 transition-colors">
            <h2 className="text-lg font-medium text-slate-100">{topic.name}</h2>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400">
              {categories.find(c => c.id === topic.categoryId)?.name || 'Unknown'}
            </span>
          </div>
        ))}
        {topics.length === 0 && (
          <div className="text-center py-12 text-slate-500 border border-dashed border-emerald-900/50 rounded-2xl">
            No topics yet. Create one above!
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-emerald-500">Loading topics...</div>}>
      <TopicsContent />
    </Suspense>
  );
}
