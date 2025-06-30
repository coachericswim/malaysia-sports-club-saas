// User and Authentication Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  profile: UserProfile;
  auth: AuthInfo;
  preferences: UserPreferences;
  metadata: UserMetadata;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality: string;
  identificationType: 'ic' | 'passport';
  identificationNumber: string;
}

export interface AuthInfo {
  role: 'superadmin' | 'member';
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: Date;
  loginCount: number;
}

export interface UserPreferences {
  language: 'en' | 'ms' | 'zh' | 'ta';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  showStats: boolean;
}

export interface UserMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  platform: 'web' | 'ios' | 'android';
  appVersion?: string;
}

// Club Types
export interface Club {
  id: string;
  name: string;
  nameSlug: string;
  sport: SportType;
  status: 'active' | 'suspended' | 'trial';
  subscription: ClubSubscription;
  profile: ClubProfile;
  contact: ContactInfo;
  address: Address;
  settings: ClubSettings;
  operatingHours: OperatingHours;
  features: ClubFeatures;
  stats: ClubStats;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ClubSubscription {
  plan: 'free' | 'professional' | 'enterprise';
  validUntil: Date;
  memberLimit: number;
}

export interface ClubProfile {
  logo: string;
  coverImage: string;
  description: string;
  established: Date;
  registration: {
    type: 'society' | 'company' | 'association';
    number: string;
  };
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp: string;
  website?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: MalaysianState;
  postcode: string;
  country: 'Malaysia';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ClubSettings {
  timezone: 'Asia/Kuala_Lumpur';
  currency: 'MYR';
  languages: Language[];
  fiscalYearStart: number;
}

export interface OperatingHours {
  [key: string]: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ClubFeatures {
  payments: boolean;
  tournaments: boolean;
  coaching: boolean;
  merchandise: boolean;
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  monthlyRevenue: number;
  facilities: number;
}

// Member Types
export interface Member {
  id: string;
  userId: string;
  memberNumber: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  profile: MemberProfile;
  membership: Membership;
  emergency: EmergencyContact;
  roles: MemberRole[];
  sports: MemberSports;
  payment: PaymentInfo;
  stats: MemberStats;
  loyalty: LoyaltyInfo;
  flags: MemberFlags;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MemberProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoURL?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
}

export interface Membership {
  tier: 'junior' | 'senior' | 'premium' | 'vip' | 'family';
  startDate: Date;
  expiryDate: Date;
  autoRenew: boolean;
  discount?: number;
}

export interface EmergencyContact {
  contactName: string;
  relationship: string;
  phone: string;
  medicalConditions?: string;
  bloodType?: string;
}

export interface MemberSports {
  sport: SportType;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'bank' | 'duitnow';
  lastPaymentDate?: Date;
  outstandingAmount: number;
  totalPaid: number;
}

export interface MemberStats {
  joinDate: Date;
  lastCheckIn?: Date;
  totalCheckIns: number;
  sessionsAttended: number;
  tournamentsPlayed: number;
  courtHoursUsed: number;
}

export interface LoyaltyInfo {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  memberSince: Date;
}

export interface MemberFlags {
  isFoundingMember: boolean;
  isLifetimeMember: boolean;
  hasOutstandingDues: boolean;
  requiresMedicalClearance: boolean;
}

// Payment Types
export interface Payment {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  amount: PaymentAmount;
  type: PaymentType;
  description: string;
  status: PaymentStatus;
  method: PaymentMethod;
  billing?: BillingInfo;
  stripe?: StripeInfo;
  timeline: PaymentTimeline;
  metadata: PaymentMetadata;
  processedBy?: string;
  refund?: RefundInfo;
}

export interface PaymentAmount {
  subtotal: number;
  tax: number;
  total: number;
  currency: 'MYR';
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'bank_transfer' | 'duitnow' | 'fpx' | 'ewallet';
  details?: {
    last4?: string;
    bank?: string;
    reference?: string;
  };
}

export interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface StripeInfo {
  paymentIntentId?: string;
  chargeId?: string;
  customerId?: string;
  receiptUrl?: string;
}

export interface PaymentTimeline {
  createdAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
}

export interface PaymentMetadata {
  sessionId?: string;
  tournamentId?: string;
  bookingId?: string;
  period?: string;
  notes?: string;
}

export interface RefundInfo {
  amount: number;
  reason: string;
  processedBy: string;
  timestamp: Date;
}

// Club Member (relationship between User and Club)
export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: 'owner' | 'admin' | 'coach' | 'member';
  permissions: string[];
  joinedAt: Date;
  status: 'active' | 'inactive' | 'suspended';
}

// Enums and Constants
export type SportType = 'badminton' | 'basketball' | 'football' | 'tennis' | 'swimming' | 'gym';
export type MalaysianState = 'Johor' | 'Kedah' | 'Kelantan' | 'Melaka' | 'Negeri Sembilan' | 'Pahang' | 'Perak' | 'Perlis' | 'Pulau Pinang' | 'Sabah' | 'Sarawak' | 'Selangor' | 'Terengganu' | 'WP Kuala Lumpur' | 'WP Labuan' | 'WP Putrajaya';
export type Language = 'en' | 'ms' | 'zh' | 'ta';
export type MemberRole = 'member' | 'coach' | 'admin' | 'staff';
export type PaymentType = 'membership' | 'training' | 'tournament' | 'booking' | 'merchandise' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';