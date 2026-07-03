import { create } from 'zustand';

interface SessionMeta {
  categoryName: string | null;
  topicName: string | null;
}

interface SessionState {
  status: 'idle' | 'running' | 'paused';
  startTime: string | null;
  targetMinutes: number; // For countdown
  selectedCategory: { id: string; name: string } | null;
  selectedTopic: { id: string; name: string } | null;
  activeSessionMeta: SessionMeta | null;
  setSession: (session: Partial<SessionState>) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  startTime: null,
  targetMinutes: 25, // Default Pomodoro
  selectedCategory: null,
  selectedTopic: null,
  activeSessionMeta: null,
  setSession: (session) => set((state) => ({ ...state, ...session })),
  resetSession: () =>
    set({
      status: 'idle',
      startTime: null,
      targetMinutes: 25,
      selectedCategory: null,
      selectedTopic: null,
      activeSessionMeta: null,
    }),
}));
