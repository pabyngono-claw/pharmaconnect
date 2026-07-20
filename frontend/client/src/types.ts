export interface User {
  id: number;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface OTPRequestResponse {
  masked_phone: string;
  cooldown_seconds: number;
  otp_text?: string; // May be returned in testing/dev environments
}

export interface OTPVerifyResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
}

export type ViewState = 'splash' | 'login' | 'otp' | 'dashboard';

export interface MedicineRequest {
  id: number;
  status: 'Pending' | 'Sent' | 'Responded' | 'Reserved' | 'Completed' | 'Cancelled' | 'Expired' | string;
  request_type?: string;
  created_at?: string | number;
  item_count?: number;
  response_count?: number;
  medicines?: Array<{ name: string; quantity: number }>;
  description?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  phone: string | null; // Temporarily store the phone number during OTP flow
  maskedPhone: string | null; // Masked phone returned from OTP request
  otpText: string | null; // Stored OTP text for debug/demo ease if returned
  view: ViewState;
  xanoApiUrl: string;
  isMockMode: boolean;
  error: string | null;
  isLoading: boolean;
}
