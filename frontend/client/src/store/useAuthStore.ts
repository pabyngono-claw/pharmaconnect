import { create } from 'zustand';
import { User, AuthState, ViewState } from '../types';
import { api, mockApi } from '../lib/api';

interface AuthActions {
  setXanoApiUrl: (url: string) => void;
  setMockMode: (isMock: boolean) => void;
  requestOtp: (rawPhone: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

// Helper to format/validate Senegal phone numbers
// Returns formatted '221XXXXXXXXX' if valid, otherwise null
export const validateSenegalPhone = (raw: string): string | null => {
  // Strip non-digit characters except maybe plus sign
  let cleaned = raw.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 221, check if followed by 9 digits
  if (cleaned.startsWith('221')) {
    const sub = cleaned.substring(3);
    if (sub.length === 9 && /^(77|78|76|75|70)/.test(sub)) {
      return cleaned;
    }
    return null;
  }
  
  // If length is 9 digits and starts with 77, 78, 76, 75, 70, prepend 221
  if (cleaned.length === 9 && /^(77|78|76|75|70)/.test(cleaned)) {
    return '221' + cleaned;
  }
  
  return null;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  // Initialize from localStorage
  const initialToken = localStorage.getItem('access_token');
  const initialRefreshToken = localStorage.getItem('refresh_token');
  const initialXanoUrl = (import.meta as any).env.VITE_XANO_API_URL || localStorage.getItem('xano_api_url') || '';
  const initialMockMode = localStorage.getItem('is_mock_mode') !== 'false'; // default to true to allow testing without crashing if URL not configured

  return {
    user: null,
    accessToken: initialToken,
    refreshToken: initialRefreshToken,
    phone: null,
    maskedPhone: null,
    otpText: null,
    view: 'splash',
    xanoApiUrl: initialXanoUrl,
    isMockMode: initialMockMode,
    error: null,
    isLoading: false,

    setXanoApiUrl: (url: string) => {
      localStorage.setItem('xano_api_url', url);
      set({ xanoApiUrl: url });
    },

    setMockMode: (isMock: boolean) => {
      localStorage.setItem('is_mock_mode', isMock ? 'true' : 'false');
      set({ isMockMode: isMock });
    },

    clearError: () => set({ error: null }),

    requestOtp: async (rawPhone: string) => {
      set({ isLoading: true, error: null });
      const validatedPhone = validateSenegalPhone(rawPhone);
      
      if (!validatedPhone) {
        set({ 
          error: 'Numéro de téléphone invalide. Doit être un numéro du Sénégal valide (ex: 771234567 ou 221771234567, commençant par 70, 75, 76, 77, ou 78).', 
          isLoading: false 
        });
        return;
      }

      try {
        const { isMockMode } = get();
        let masked_phone = '';
        let cooldown_seconds = 0;
        let otp_text: string | undefined;

        if (isMockMode) {
          const res = await mockApi.requestOtp(validatedPhone);
          masked_phone = res.data.masked_phone;
          cooldown_seconds = res.data.cooldown_seconds;
          otp_text = res.data.otp_text;
        } else {
          const baseUrl = get().xanoApiUrl;
          if (!baseUrl) {
            throw new Error("L'URL de l'API Xano n'est pas configurée. Veuillez activer le mode démo ou renseigner l'URL.");
          }
          const res = await api.post('/auth/Request_OTP', { phone: validatedPhone });
          masked_phone = res.data.masked_phone;
          cooldown_seconds = res.data.cooldown_seconds;
          otp_text = res.data.otp_text;
        }

        // Store phone number and otp details in local storage temporarily to survive reloads if needed
        localStorage.setItem('auth_phone', validatedPhone);

        set({
          phone: validatedPhone,
          maskedPhone: masked_phone,
          otpText: otp_text || null,
          view: 'otp',
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        set({
          error: err.response?.data?.message || err.message || 'Une erreur est survenue lors de la demande OTP.',
          isLoading: false,
        });
      }
    },

    verifyOtp: async (otpCode: string) => {
      set({ isLoading: true, error: null });
      const currentPhone = get().phone || localStorage.getItem('auth_phone');
      
      if (!currentPhone) {
        set({ error: 'Session expirée. Veuillez saisir à nouveau votre numéro.', view: 'login', isLoading: false });
        return;
      }

      if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
        set({ error: 'Le code OTP doit contenir 6 chiffres.', isLoading: false });
        return;
      }

      try {
        const { isMockMode } = get();
        let accessToken = '';
        let refreshToken = '';

        if (isMockMode) {
          const res = await mockApi.verifyOtp(currentPhone, otpCode);
          accessToken = res.data.access_token;
          refreshToken = res.data.refresh_token;
        } else {
          const res = await api.post('/auth/Verify_OTP', {
            phone: currentPhone,
            otp: otpCode,
          });
          accessToken = res.data.access_token;
          refreshToken = res.data.refresh_token;
        }

        // Save tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Fetch user profile
        let user: User;
        if (isMockMode) {
          const res = await mockApi.getMe(accessToken);
          user = res.data;
        } else {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          user = res.data;
        }

        set({
          user,
          accessToken,
          refreshToken,
          view: 'dashboard',
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        set({
          error: err.response?.data?.message || err.message || 'Code OTP incorrect ou expiré.',
          isLoading: false,
        });
      }
    },

    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_phone');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        phone: null,
        maskedPhone: null,
        otpText: null,
        view: 'login',
        error: null,
        isLoading: false,
      });
    },

    restoreSession: async () => {
      set({ isLoading: true, error: null });
      const token = localStorage.getItem('access_token');
      const isMockMode = get().isMockMode;

      if (!token) {
        set({ view: 'login', isLoading: false });
        return;
      }

      try {
        let user: User;
        if (isMockMode) {
          const res = await mockApi.getMe(token);
          user = res.data;
        } else {
          const res = await api.get('/auth/me');
          user = res.data;
        }

        set({
          user,
          accessToken: token,
          refreshToken: localStorage.getItem('refresh_token'),
          phone: localStorage.getItem('auth_phone'),
          view: 'dashboard',
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        // Token is invalid, clear session
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          view: 'login',
          isLoading: false,
        });
      }
    },

    setUser: (user: User | null) => set({ user }),
  };
});

// Setup listener for unauthorized event from api client
if (typeof window !== 'undefined') {
  window.addEventListener('auth-unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
