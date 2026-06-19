import { create } from 'zustand';

interface UserState {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: any, token: string) => void;
  logout: () => void;
}

// Temporary mock user until Auth is done
const MOCK_USER = {
  id: 'user-001',
  name: 'Mock User',
  email: 'user-001@itxstudie.dev'
};

export const useUserStore = create<UserState>((set) => ({
  user: MOCK_USER,
  isAuthenticated: true,
  token: 'mock_token',
  setUser: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
