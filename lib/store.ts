import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'client' | 'agent';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    const state = get();
    if (!state.isLoading && state.user) {
      return; // Already checked and user exists
    }
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, token: null, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

