import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Get base URL from env if present, or allow fallback
const getBaseUrl = (): string => {
  return (import.meta as any).env.VITE_XANO_API_URL || localStorage.getItem('xano_api_url') || '';
};

export const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseUrl dynamically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically assign base URL in case it changed in settings
    const baseUrl = getBaseUrl();
    if (baseUrl) {
      config.baseURL = baseUrl;
    }

    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle 401s
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Let the app know about the unauthorized state
      // We can dispatch a custom event or let the auth store handle it
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Define Mock API responses for smooth developer onboarding / demo purposes
export const mockApi = {
  requestOtp: async (phone: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Simple validation of Senegal number format in mock too
    if (!phone.startsWith('221') || phone.length !== 12) {
      throw new Error('Format de téléphone invalide pour le Sénégal (ex: 221771234567)');
    }
    
    // Mask phone like: 22177****567
    const prefix = phone.substring(0, 5);
    const suffix = phone.substring(9);
    const masked = `${prefix}****${suffix}`;
    
    return {
      data: {
        masked_phone: masked,
        cooldown_seconds: 0,
        otp_text: '123456', // Mock OTP code
      },
    };
  },

  verifyOtp: async (phone: string, otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (otp !== '123456') {
      throw new Error('Code OTP incorrect. Veuillez utiliser "123456".');
    }

    return {
      data: {
        access_token: 'mock_access_token_jwt_xyz123',
        refresh_token: 'mock_refresh_token_jwt_xyz123',
        user_id: 1,
      },
    };
  },

  getMe: async (token: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    if (!token || token === 'invalid') {
      throw { response: { status: 401, data: { message: 'Unauthorized' } } };
    }

    return {
      data: {
        id: 1,
        phone: localStorage.getItem('auth_phone') || '221771234567',
        role: 'Patient',
        is_verified: true,
        is_active: true,
      },
    };
  },

  getMyRequests: async (): Promise<{ data: any[] }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Store in localStorage if we want to allow additions/persistence
    const stored = localStorage.getItem('mock_requests');
    if (stored) {
      return { data: JSON.parse(stored) };
    }

    const initialMockRequests = [
      {
        id: 1248,
        status: 'Pending',
        request_type: 'Demande de Produit',
        created_at: '2026-07-19T14:30:00Z',
        item_count: 2,
        response_count: 0,
        medicines: [
          { name: 'Paracétamol 500mg', quantity: 2 },
          { name: 'Amoxicilline 1g', quantity: 1 }
        ],
        description: 'Recherche urgente pour traitement grippal.'
      },
      {
        id: 1105,
        status: 'Responded',
        request_type: "Renouvellement d'Ordonnance",
        created_at: '2026-07-15T09:15:00Z',
        item_count: 1,
        response_count: 3,
        medicines: [
          { name: 'Loratadine 10mg', quantity: 3 }
        ],
        description: "Renouvellement ordonnance annuelle d'antiallergiques."
      },
      {
        id: 982,
        status: 'Reserved',
        request_type: "Demande d'Équipement Médical",
        created_at: '2026-07-10T11:00:00Z',
        item_count: 1,
        response_count: 1,
        medicines: [
          { name: 'Tensiomètre Électronique', quantity: 1 }
        ],
        description: 'Tensiomètre de bras pour suivi régulier.'
      },
      {
        id: 874,
        status: 'Completed',
        request_type: 'Demande de Produit',
        created_at: '2026-07-02T16:45:00Z',
        item_count: 3,
        response_count: 2,
        medicines: [
          { name: 'Ibuprofène 400mg', quantity: 1 },
          { name: 'Vitamine C 1000mg', quantity: 2 },
          { name: 'Doliprane 1g', quantity: 2 }
        ],
        description: 'Achat de routine pharmacie familiale.'
      }
    ];

    localStorage.setItem('mock_requests', JSON.stringify(initialMockRequests));
    return { data: initialMockRequests };
  }
};
