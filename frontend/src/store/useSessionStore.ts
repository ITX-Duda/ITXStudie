import { create } from 'zustand';

interface SessionState {
  status: 'idle' | 'running' | 'paused';
  startTime: string | null;
  targetMinutes: number; // For countdown
  selectedCategory: { id: string; name: string } | null;
  selectedTopic: { id: string; name: string } | null;
  setSession: (session: Partial<SessionState>) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  startTime: null,
  targetMinutes: 25, // Default Pomodoro
  selectedCategory: null,
  selectedTopic: null,
  setSession: (session) => set((state) => ({ ...state, ...session })),
  resetSession: () => set({ status: 'idle', startTime: null, targetMinutes: 25, selectedCategory: null, selectedTopic: null }),
}));
