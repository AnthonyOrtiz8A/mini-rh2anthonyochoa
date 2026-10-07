// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginCredentials } from '../types';
import toast from 'react-hot-toast';
import { authService, isTokenExpired } from '../services/authService';
import { extractErrorMessage } from '../utils/errorHandler';

// El refresh token rota: usarlo dos veces invalida la sesión que acaba de
// renovarse. React StrictMode (y una carrera entre el chequeo periódico y el
// interceptor de 401) puede disparar refreshSession() dos veces casi a la vez
// con el mismo refresh token — esta promesa compartida evita la segunda
// llamada real: quien llegue mientras una renovación ya está en curso recibe
// el mismo resultado, en vez de mandar un segundo refresh que el servidor
// rechazaría.
let refreshInFlight: Promise<string | null> | null = null;

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  // Devuelve el nuevo access token si la renovación funcionó, o null si no
  // había sesión que renovar o el refresh token también venció.
  refreshSession: () => Promise<string | null>;
  checkTokenValidity: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success(`Bienvenido, ${user.firstName} 👋`);
        } catch (err: unknown) {
          // Mensaje en español según error.code (INVALID_CREDENTIALS, red caída...)
          set({ error: extractErrorMessage(err), isLoading: false });
        }
      },

      logout: async () => {
        const refreshToken = get().user?.refreshToken;
        if (refreshToken) {
          await authService.logout(refreshToken);
          toast.success('Sesión cerrada correctamente.');
        }
        set({ user: null, isAuthenticated: false, error: null });
      },

      refreshSession: async () => {
        if (refreshInFlight) return refreshInFlight;

        const refreshToken = get().user?.refreshToken;
        if (!refreshToken) {
          set({ user: null, isAuthenticated: false });
          return null;
        }

        refreshInFlight = authService.refresh(refreshToken)
          .then((user) => {
            set({ user, isAuthenticated: true });
            return user.accessToken;
          })
          .catch(() => {
            // El refresh token también venció o fue revocado: no hay forma de
            // seguir la sesión sin pedirle al usuario que inicie sesión de nuevo.
            set({ user: null, isAuthenticated: false });
            toast.error('Tu sesión ha expirado. Inicia sesión de nuevo.');
            return null;
          })
          .finally(() => {
            refreshInFlight = null;
          });

        return refreshInFlight;
      },

      // Llamar al montar la app y cada pocos minutos: si el access token ya
      // expiró, intenta renovarlo en silencio antes de cerrar la sesión.
      checkTokenValidity: () => {
        const { user, refreshSession, logout } = get();
        if (user?.accessToken && isTokenExpired(user.accessToken)) {
          refreshSession().then((newToken) => {
            if (!newToken) logout();
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);