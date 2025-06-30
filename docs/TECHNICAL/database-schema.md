# Database Schema - Malaysian Sports Club SaaS

## 🗄️ Overview - Single Club Database

This document outlines the Firestore database structure for a SINGLE sports club deployment. Each instance serves ONE club only. The database is designed for managing one sports organization's complete operations.

## 📊 Database Design Principles

1. **Denormalization**: Store related data together for faster reads
2. **Real-time First**: Structure supports Firebase listeners
3. **Security**: Implement field-level security rules
4. **Scalability**: Design for 10,000+ members in a single club
5. **Localization**: Support for Malaysian context
6. **Single-Club**: One club per deployment, no multi-tenancy

## 🏢 Collections Structure

### 1. `club` Document (Single Document)

Stores THE club's information. Only ONE document exists in this collection.

```typescript
interface Club {
  id: string; // Auto-generated
  name: string;
  nameSlug: string; // URL-friendly name
  sport: SportType; // Single sport per club
  status: 'active' | 'suspended' | 'trial';
  subscription: {
    plan: 'free' | 'professional' | 'enterprise';
    validUntil: Timestamp;
    memberLimit: number;
  };
  profile: {
    logo: string; // Storage URL
    coverImage: string;
    description: string;
    established: Timestamp;
    registration: {
      type: 'society' | 'company' | 'association';
      number: string; // ROS/SSM number
    };
  };
  contact: {
    phone: string; // +60 format
    email: string;
    whatsapp: string;
    website?: string;
  };
  address: {
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
  };
  settings: {
    timezone: 'Asia/Kuala_Lumpur';
    currency: 'MYR';
    languages: Language[];
    fiscalYearStart: number; // Month (1-12)
  };
  operatingHours: {
    [key in DayOfWeek]: {
      isOpen: boolean;
      openTime: string; // "09:00"
      closeTime: string; // "22:00"
      breaks?: Array<{
        start: string;
        end: string;
      }>;
    };
  };
  features: {
    payments: boolean;
    tournaments: boolean;
    coaching: boolean;
    merchandise: boolean;
  };
  stats: {
    totalMembers: number;
    activeMembers: number;
    monthlyRevenue: number;
    facilities: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
}

type SportType = 'badminton' | 'basketball' | 'football' | 'tennis' | 'swimming' | 'gym';
type MalaysianState = 'Johor' | 'Kedah' | 'Kelantan' | 'Melaka' | 'Negeri Sembilan' | 'Pahang' | 'Perak' | 'Perlis' | 'Pulau Pinang' | 'Sabah' | 'Sarawak' | 'Selangor' | 'Terengganu' | 'WP Kuala Lumpur' | 'WP Labuan' | 'WP Putrajaya';
type Language = 'en' | 'ms' | 'zh' | 'ta';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
```

### 2. `users` Collection

Stores all user accounts across the platform.

```typescript
interface User {
  id: string; // Firebase Auth UID
  email: string;
  phone?: string; // +60 format
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    photoURL?: string;
    dateOfBirth?: Timestamp;
    gender?: 'male' | 'female' | 'other';
    nationality: string; // Default: 'Malaysian'
    identificationType: 'ic' | 'passport';
    identificationNumber: string; // Encrypted
  };
  auth: {
    role: 'superadmin' | 'member';
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastLogin: Timestamp;
    loginCount: number;
  };
  preferences: {
    language: Language;
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      push: boolean;
    };
    privacy: {
      showProfile: boolean;
      showStats: boolean;
    };
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastActive: Timestamp;
    platform: 'web' | 'ios' | 'android';
    appVersion?: string;
  };
}
```

### 3. `members` Collection (Subcollection of clubs)

Path: `/clubs/{clubId}/members/{memberId}`

```typescript
interface Member {
  id: string;
  userId: string; // Reference to users collection
  memberNumber: string; // "KLB2024001"
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  
  // Denormalized user data for quick access
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photoURL?: string;
    dateOfBirth: Timestamp;
    gender: 'male' | 'female' | 'other';
  };
  
  membership: {
    tier: 'junior' | 'senior' | 'premium' | 'vip' | 'family';
    startDate: Timestamp;
    expiryDate: Timestamp;
    autoRenew: boolean;
    discount?: number; // Percentage
  };
  
  emergency: {
    contactName: string;
    relationship: string;
    phone: string;
    medicalConditions?: string;
    bloodType?: string;
  };
  
  roles: Array<'member' | 'coach' | 'admin' | 'staff'>;
  
  sports: {
    primary: SportType;
    others: SportType[];
    level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  
  payment: {
    method: 'cash' | 'card' | 'bank' | 'duitnow';
    lastPaymentDate?: Timestamp;
    outstandingAmount: number;
    totalPaid: number;
  };
  
  stats: {
    joinDate: Timestamp;
    lastCheckIn?: Timestamp;
    totalCheckIns: number;
    sessionsAttended: number;
    tournamentsPlayed: number;
    courtHoursUsed: number;
  };
  
  loyalty: {
    points: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    memberSince: Timestamp;
  };
  
  flags: {
    isFoundingMember: boolean;
    isLifetimeMember: boolean;
    hasOutstandingDues: boolean;
    requiresMedicalClearance: boolean;
  };
  
  notes?: string; // Admin notes
  tags?: string[]; // Custom tags
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Admin who created
}
```

### 4. `payments` Collection (Subcollection)

Path: `/clubs/{clubId}/payments/{paymentId}`

```typescript
interface Payment {
  id: string;
  invoiceNumber: string; // "INV-2024-0001"
  memberId: string;
  memberName: string; // Denormalized
  
  amount: {
    subtotal: number;
    tax: number; // SST 6%
    total: number;
    currency: 'MYR';
  };
  
  type: 'membership' | 'training' | 'tournament' | 'booking' | 'merchandise' | 'other';
  description: string;
  
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  
  method: {
    type: 'cash' | 'card' | 'bank_transfer' | 'duitnow' | 'fpx' | 'ewallet';
    details?: {
      last4?: string; // Card last 4 digits
      bank?: string; // Bank name
      reference?: string; // Transfer reference
    };
  };
  
  billing?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  
  stripe?: {
    paymentIntentId?: string;
    chargeId?: string;
    customerId?: string;
    receiptUrl?: string;
  };
  
  timeline: {
    createdAt: Timestamp;
    processedAt?: Timestamp;
    failedAt?: Timestamp;
    refundedAt?: Timestamp;
  };
  
  metadata: {
    sessionId?: string; // Training session
    tournamentId?: string;
    bookingId?: string;
    period?: string; // "2024-01" for monthly fees
    notes?: string;
  };
  
  processedBy?: string; // Staff user ID
  refund?: {
    amount: number;
    reason: string;
    processedBy: string;
    timestamp: Timestamp;
  };
}
```

### 5. `sessions` Collection (Subcollection)

Path: `/clubs/{clubId}/sessions/{sessionId}`

```typescript
interface TrainingSession {
  id: string;
  title: string;
  description?: string;
  type: 'regular' | 'special' | 'camp' | 'private';
  sport: SportType;
  
  coach: {
    id: string;
    name: string;
    photoURL?: string;
  };
  
  schedule: {
    startTime: Timestamp;
    endTime: Timestamp;
    duration: number; // minutes
    timezone: 'Asia/Kuala_Lumpur';
  };
  
  venue: {
    facilityId: string;
    name: string; // "Court 1-2"
    type: 'court' | 'field' | 'pool' | 'gym';
  };
  
  capacity: {
    min: number;
    max: number;
    enrolled: number;
    waitlist: number;
  };
  
  requirements: {
    level: 'all' | 'beginner' | 'intermediate' | 'advanced';
    ageMin?: number;
    ageMax?: number;
    gender?: 'all' | 'male' | 'female';
    equipment?: string[];
  };
  
  pricing: {
    memberPrice: number;
    nonMemberPrice?: number;
    dropInAllowed: boolean;
    packageOnly: boolean;
  };
  
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[]; // 0-6
    endDate?: Timestamp;
    parentId?: string; // Original session
  };
  
  participants: string[]; // Member IDs
  waitlist: string[]; // Member IDs
  
  attendance?: {
    present: string[];
    absent: string[];
    late: string[];
    markedAt?: Timestamp;
    markedBy?: string;
  };
  
  cancellation?: {
    reason: string;
    cancelledAt: Timestamp;
    cancelledBy: string;
    notificationsSent: boolean;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### 6. `bookings` Collection (Subcollection)

Path: `/clubs/{clubId}/bookings/{bookingId}`

```typescript
interface Booking {
  id: string;
  bookingCode: string; // "BK-20240120-001"
  type: 'court' | 'facility' | 'equipment';
  
  member: {
    id: string;
    name: string;
    phone: string;
  };
  
  resource: {
    id: string;
    name: string; // "Badminton Court 1"
    type: string;
  };
  
  slot: {
    date: Timestamp;
    startTime: string; // "18:00"
    endTime: string; // "20:00"
    duration: number; // minutes
  };
  
  players?: Array<{
    memberId?: string;
    name: string;
    isGuest: boolean;
  }>;
  
  pricing: {
    basePrice: number;
    peakCharge?: number;
    memberDiscount?: number;
    totalPrice: number;
  };
  
  payment: {
    status: 'pending' | 'paid' | 'refunded';
    method?: string;
    paymentId?: string;
    paidAt?: Timestamp;
  };
  
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  
  checkIn?: {
    time: Timestamp;
    by: string; // Staff ID
  };
  
  cancellation?: {
    reason: string;
    cancelledAt: Timestamp;
    refundAmount?: number;
    refundStatus?: string;
  };
  
  notes?: string;
  
  metadata: {
    source: 'app' | 'web' | 'admin' | 'walk_in';
    ipAddress?: string;
    userAgent?: string;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7. `tournaments` Collection (Subcollection)

Path: `/clubs/{clubId}/tournaments/{tournamentId}`

```typescript
interface Tournament {
  id: string;
  name: string;
  slug: string; // URL-friendly
  sport: SportType;
  
  details: {
    description: string;
    rules: string;
    prizes: Array<{
      position: string;
      prize: string;
      value?: number;
    }>;
    sponsors: Array<{
      name: string;
      logo: string;
      tier: 'title' | 'gold' | 'silver' | 'bronze';
    }>;
  };
  
  schedule: {
    registrationOpen: Timestamp;
    registrationClose: Timestamp;
    startDate: Timestamp;
    endDate: Timestamp;
    drawDate: Timestamp;
  };
  
  format: {
    type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
    categories: Array<{
      id: string;
      name: string; // "Men's Singles A"
      ageGroup?: string;
      skillLevel?: string;
      maxParticipants: number;
    }>;
  };
  
  registration: {
    fee: number;
    earlyBirdFee?: number;
    earlyBirdDeadline?: Timestamp;
    requirements: {
      memberOnly: boolean;
      minAge?: number;
      maxAge?: number;
      requiresPartner?: boolean; // For doubles
    };
  };
  
  participants: {
    registered: number;
    capacity: number;
    entries: Array<{
      id: string;
      playerId: string;
      playerName: string;
      category: string;
      partnerId?: string;
      partnerName?: string;
      seed?: number;
      registeredAt: Timestamp;
      paymentStatus: string;
    }>;
  };
  
  bracket?: {
    rounds: Array<{
      roundNumber: number;
      matches: Array<{
        matchId: string;
        court?: string;
        scheduledTime?: Timestamp;
        player1: string;
        player2: string;
        winner?: string;
        score?: string;
        status: 'pending' | 'ongoing' | 'completed';
      }>;
    }>;
  };
  
  status: 'draft' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
  
  results?: {
    champions: Map<string, string>; // category -> winner
    finalists: Map<string, string[]>;
    completedAt: Timestamp;
  };
  
  media: {
    poster?: string;
    photos: string[];
    liveStreamUrl?: string;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### 8. `facilities` Collection (Subcollection)

Path: `/clubs/{clubId}/facilities/{facilityId}`

```typescript
interface Facility {
  id: string;
  name: string;
  code: string; // "BC-01"
  type: 'badminton_court' | 'basketball_court' | 'tennis_court' | 'football_field' | 'swimming_pool' | 'gym' | 'hall';
  
  details: {
    description?: string;
    capacity?: number;
    size?: string; // "Full size"
    surface?: string; // "Wooden", "Synthetic"
    features: string[]; // ["Air-conditioned", "LED Lighting"]
    images: string[];
  };
  
  availability: {
    isActive: boolean;
    operatingHours: {
      [key: string]: { // day of week
        open: string;
        close: string;
      };
    };
    blockouts: Array<{
      startDate: Timestamp;
      endDate: Timestamp;
      reason: string;
    }>;
  };
  
  pricing: {
    currency: 'MYR';
    rates: Array<{
      name: string; // "Peak", "Off-Peak"
      memberPrice: number;
      nonMemberPrice: number;
      timeSlots: Array<{
        days: number[]; // 0-6
        startTime: string;
        endTime: string;
      }>;
    }>;
  };
  
  booking: {
    advanceDays: number;
    minDuration: number; // minutes
    maxDuration: number;
    slotInterval: number; // 30 or 60 minutes
    requiresApproval: boolean;
    autoConfirm: boolean;
  };
  
  maintenance: {
    lastServiced?: Timestamp;
    nextService?: Timestamp;
    logs: Array<{
      date: Timestamp;
      type: string;
      description: string;
      performedBy: string;
    }>;
  };
  
  stats: {
    utilizationRate: number; // percentage
    totalBookings: number;
    revenue: {
      daily: number;
      monthly: number;
      yearly: number;
    };
  };
  
  equipment?: Array<{
    name: string;
    quantity: number;
    condition: string;
    included: boolean;
  }>;
  
  rules?: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 9. `announcements` Collection (Subcollection)

Path: `/clubs/{clubId}/announcements/{announcementId}`

```typescript
interface Announcement {
  id: string;
  title: string;
  content: string; // Rich text/Markdown
  type: 'general' | 'urgent' | 'maintenance' | 'event' | 'promotion';
  priority: 'low' | 'medium' | 'high';
  
  audience: {
    target: 'all' | 'members' | 'staff' | 'specific';
    memberTiers?: string[];
    specificMembers?: string[];
  };
  
  media: {
    images?: string[];
    documents?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  };
  
  schedule: {
    publishAt: Timestamp;
    expiresAt?: Timestamp;
    isPinned: boolean;
  };
  
  delivery: {
    channels: Array<'app' | 'email' | 'sms' | 'whatsapp'>;
    sent: {
      app: boolean;
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
    stats: {
      totalRecipients: number;
      delivered: number;
      read: number;
    };
  };
  
  translations?: {
    ms?: {
      title: string;
      content: string;
    };
    zh?: {
      title: string;
      content: string;
    };
  };
  
  interactions: {
    views: number;
    likes?: number;
    viewers: string[]; // Member IDs who viewed
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastEditedBy?: string;
}
```

### 10. `staff` Collection (Subcollection)

Path: `/clubs/{clubId}/staff/{staffId}`

```typescript
interface Staff {
  id: string;
  userId: string; // Reference to users collection
  employeeId: string;
  
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photoURL?: string;
    nationality: string;
  };
  
  employment: {
    position: 'admin' | 'coach' | 'receptionist' | 'maintenance' | 'manager';
    department?: string;
    startDate: Timestamp;
    endDate?: Timestamp;
    type: 'full_time' | 'part_time' | 'contract' | 'volunteer';
    status: 'active' | 'on_leave' | 'terminated';
  };
  
  access: {
    role: 'super_admin' | 'admin' | 'staff' | 'coach';
    permissions: string[]; // Specific permissions
    areas: string[]; // Physical areas access
  };
  
  coaching?: {
    specializations: SportType[];
    certifications: Array<{
      name: string;
      issuer: string;
      date: Timestamp;
      expiry?: Timestamp;
      document?: string;
    }>;
    experience: string;
    bio?: string;
    rates: {
      group: number; // per session
      private: number; // per hour
    };
    availability: {
      [key: string]: { // day of week
        available: boolean;
        slots?: string[];
      };
    };
    rating?: number;
    reviews?: number;
  };
  
  payroll?: {
    salary?: number;
    paymentMethod: string;
    bankDetails?: { // Encrypted
      bank: string;
      accountNumber: string;
      accountName: string;
    };
  };
  
  attendance: {
    checkIns: Array<{
      date: Timestamp;
      checkIn: Timestamp;
      checkOut?: Timestamp;
      hours?: number;
    }>;
    leaves: Array<{
      type: string;
      startDate: Timestamp;
      endDate: Timestamp;
      approved: boolean;
    }>;
  };
  
  emergency: {
    contactName: string;
    relationship: string;
    phone: string;
  };
  
  documents: Array<{
    type: string; // "IC", "Permit", "Certification"
    name: string;
    url: string; // Secure storage
    uploadedAt: Timestamp;
  }>;
  
  notes?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

## 🔐 Security Rules Examples

### Member Access Control

```javascript
// Members can only read their own data
match /clubs/{clubId}/members/{memberId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.userId || 
     isClubAdmin(clubId));
  allow write: if isClubAdmin(clubId);
}
```

### Payment Security

```javascript
// Only admins can modify payments
match /clubs/{clubId}/payments/{paymentId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.memberId || 
     isClubStaff(clubId));
  allow create: if isClubStaff(clubId);
  allow update: if isClubAdmin(clubId) && 
    !resource.data.keys().hasAny(['amount', 'status']);
}
```

## 🚀 Performance Optimization

### Composite Indexes

Required for complex queries:

1. **Member Search**
   - Collection: `members`
   - Fields: `status`, `membership.tier`, `profile.lastName`

2. **Payment Reports**
   - Collection: `payments`
   - Fields: `status`, `type`, `timeline.createdAt`

3. **Session Availability**
   - Collection: `sessions`
   - Fields: `sport`, `schedule.startTime`, `status`

### Data Aggregation

Use Cloud Functions to maintain counters:

```typescript
// Automatically update club stats
export const updateMemberCount = functions.firestore
  .document('clubs/{clubId}/members/{memberId}')
  .onWrite(async (change, context) => {
    const clubRef = admin.firestore()
      .collection('clubs')
      .doc(context.params.clubId);
    
    // Increment or decrement based on operation
    const increment = change.after.exists ? 1 : -1;
    
    await clubRef.update({
      'stats.totalMembers': admin.firestore.FieldValue.increment(increment)
    });
  });
```

## 📊 Query Examples

### Get Active Members

```typescript
const activeMembers = await firestore
  .collection('clubs')
  .doc(clubId)
  .collection('members')
  .where('status', '==', 'active')
  .where('membership.expiryDate', '>', new Date())
  .orderBy('membership.expiryDate')
  .limit(20)
  .get();
```

### Revenue Report

```typescript
const monthlyRevenue = await firestore
  .collection('clubs')
  .doc(clubId)
  .collection('payments')
  .where('status', '==', 'succeeded')
  .where('timeline.createdAt', '>=', startOfMonth)
  .where('timeline.createdAt', '<=', endOfMonth)
  .get();

const total = monthlyRevenue.docs.reduce((sum, doc) => 
  sum + doc.data().amount.total, 0);
```

## 🔄 Migration Strategy

For schema updates:

1. Version fields in documents
2. Use Cloud Functions for migrations
3. Implement backward compatibility
4. Test with subset before full migration
5. Monitor for errors during migration

---

📚 For implementation details, see our [API Documentation](../API.md)