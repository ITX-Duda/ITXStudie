import { create } from 'zustand';

export interface CirclePhase {
  id: string;
  circleId: string;
  order: number;
  type: 'study' | 'break';
  durationMins: number;
  label?: string | null;
  categoryId?: string | null;
  topicId?: string | null;
  category?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
}

export interface StudyCircle {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  phases: CirclePhase[];
}

export interface CircleRun {
  id: string;
  circleId: string;
  userId: string;
  status: 'running' | 'completed' | 'abandoned';
  currentPhaseOrder: number;
  startedAt: string;
  completedAt?: string | null;
  circle: StudyCircle;
}

interface CircleStoreState {
  activeCircle: StudyCircle | null;
  activeRun: CircleRun | null;
  currentPhase: CirclePhase | null;
  activeSession: { id: string; startTime: string } | null;

  setCircleRun: (circle: StudyCircle, run: CircleRun, phase: CirclePhase, session: { id: string; startTime: string } | null) => void;
  updateAfterAdvance: (run: CircleRun, phase: CirclePhase | null, session: { id: string; startTime: string } | null) => void;
  resetCircle: () => void;
}

export const useCircleStore = create<CircleStoreState>((set) => ({
  activeCircle: null,
  activeRun: null,
  currentPhase: null,
  activeSession: null,

  setCircleRun: (circle, run, phase, session) =>
    set({ activeCircle: circle, activeRun: run, currentPhase: phase, activeSession: session }),

  updateAfterAdvance: (run, phase, session) =>
    set({ activeRun: run, currentPhase: phase, activeSession: session }),

  resetCircle: () =>
    set({ activeCircle: null, activeRun: null, currentPhase: null, activeSession: null }),
}));
