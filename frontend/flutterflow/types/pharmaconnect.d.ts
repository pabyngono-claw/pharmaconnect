// Shared type reference mirroring backend/xano/schema.sql
// Intended for FlutterFlow Custom Code review and Worker type checks.

export type UUID = string;

export type RoleEnum = 'patient' | 'pharmacy' | 'admin' | 'super_admin';
export type PurposeEnum = 'login' | 'reset' | 'link';
export type PlatformEnum = 'ios' | 'android' | 'web';
export type ApprovalStatusEnum = 'pending' | 'approved' | 'rejected' | 'suspended';
export type DocumentTypeEnum = 'business_registration' | 'pharmacy_license' | 'pharmacist_diploma' | 'owner_id';
export type StaffRoleEnum = 'owner' | 'manager' | 'staff';
export type DocumentStatusEnum = 'pending' | 'approved' | 'rejected';
export type ProductTypeEnum = 'prescription' | 'product' | 'equipment';
export type RequestStatusEnum = 'submitted' | 'expired' | 'reserved' | 'served' | 'cancelled';
export type RequestPharmacyStatusEnum = 'sent' | 'viewed' | 'responded';
export type ResponseStatusEnum = 'available' | 'reserved' | 'rejected' | 'expired';
export type ReservationStateEnum = 'submitted' | 'ready' | 'served' | 'rejected' | 'expired' | 'cancelled';
export type WaitingStateEnum = 'ready' | 'expired' | 'served' | 'cancelled';
export type NotificationTypeEnum = 'request' | 'response' | 'reservation' | 'waiting' | 'payment' | 'subscription';
export type TicketTierEnum = 'tier1' | 'tier2' | 'tier3';
export type TicketStatusEnum = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SubscriptionStatusEnum = 'trial' | 'active' | 'past_due' | 'expired' | 'cancelled';
export type PaymentStatusEnum = 'pending' | 'authorized' | 'succeeded' | 'failed' | 'refunded';
export type ProviderEnum = 'orange_money' | 'wave';

export interface IcoUser {
  id: UUID;
  phone: string;
  email?: string | null;
  role: RoleEnum;
  is_verified: boolean;
  metadata?: Record<string, unknown>;
}

export interface IcoPharmacy {
  id: UUID;
  organization_id: UUID;
  name: string;
  address: string;
  quartier: string;
  lat: number;
  lng: number;
  phone: string;
  approval_status: ApprovalStatusEnum;
  is_active: boolean;
}

export interface IcoRequest {
  id: UUID;
  patient_id: UUID;
  prescription_images_count: number;
  product_type: ProductTypeEnum;
  notes?: string | null;
  quantity?: number | null;
  expires_at: string;
  re_broadcast_suggested: boolean;
  status: RequestStatusEnum;
}

export interface IcoResponse {
  id: UUID;
  request_id: UUID;
  pharmacy_id: UUID;
  unit_price: number;
  quantity: number;
  tva_rate: number;
  tva_amount: number;
  total: number;
  status: ResponseStatusEnum;
}

export interface IcoReservation {
  id: UUID;
  request_id: UUID;
  response_id: UUID;
  pharmacy_id: UUID;
  patient_id: UUID;
  state: ReservationStateEnum;
  hold_expires_at?: string | null;
}
