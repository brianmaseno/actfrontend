import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string; // MongoDB ObjectId is returned as string
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'client';
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ username, password });
          const { user, tokens } = response.data;

          // Save tokens to localStorage
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);

          // Update state - mark as initialized too
          set({ 
            user, 
            isAuthenticated: true, 
            isInitialized: true,
            isLoading: false 
          });
          
          console.log('[AUTH] Login successful, tokens saved:', {
            access: tokens.access.substring(0, 20) + '...',
            user: user.username
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          const { user, tokens } = response.data;

          // Save tokens to localStorage
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);

          // Update state - mark as initialized too
          set({ 
            user, 
            isAuthenticated: true, 
            isInitialized: true,
            isLoading: false 
          });
          
          console.log('[AUTH] Registration successful, tokens saved:', {
            access: tokens.access.substring(0, 20) + '...',
            user: user.username
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          const errors = error.response?.data;
          if (errors) {
            Object.keys(errors).forEach((key) => {
              toast.error(`${key}: ${errors[key]}`);
            });
          } else {
            toast.error('Registration failed');
          }
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isInitialized: true });
        toast.success('Logged out successfully');
      },

      fetchUser: async () => {
        try {
          const response = await authAPI.getProfile();
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      },

      initialize: async () => {
        // Check if we have a token
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          // No token, user is not authenticated
          set({ user: null, isAuthenticated: false, isInitialized: true });
          return;
        }

        // We have a token, verify it's valid
        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile();
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isInitialized: true,
            isLoading: false 
          });
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isInitialized: true,
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not authentication state
      // Authentication state will be verified on app initialization
      partialize: (state) => ({ user: state.user }),
    }
  )
);
