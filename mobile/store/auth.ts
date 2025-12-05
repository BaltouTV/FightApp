import { create } from 'zustand';
import { api } from '../services/api';
import { UserDTO, LoginRequestDTO, RegisterRequestDTO } from '../types';

interface AuthState {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (data: LoginRequestDTO) => Promise<void>;
  register: (data: RegisterRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (data: LoginRequestDTO) => {
    const response = await api.login(data);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (data: RegisterRequestDTO) => {
    const response = await api.register(data);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await api.getToken();
      if (token) {
        const user = await api.getCurrentUser();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

