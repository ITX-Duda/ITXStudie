import { create } from 'zustand';

type SessionStatus = 'idle' | 'running';

interface SessionStore {
  status: SessionStatus;
  startSession: () => void;
  stopSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  status: 'idle',
  startSession: () => set({ status: 'running' }),
  stopSession: () => set({ status: 'idle' }),
}));
