import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Club, ClubMember, User } from '@/types';

// Generate a URL-friendly slug from club name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get THE club (single-club deployment)
export const getTheClub = async (): Promise<Club | null> => {
  try {
    // In a single-club deployment, we fetch the first (and only) club
    const clubsQuery = query(collection(db, 'clubs'), limit(1));
    const snapshot = await getDocs(clubsQuery);
    
    if (!snapshot.empty) {
      const clubDoc = snapshot.docs[0];
      return { id: clubDoc.id, ...clubDoc.data() } as Club;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching the club:', error);
    return null;
  }
};

// Create a new club
export const createClub = async (
  clubData: Partial<Club>, 
  creatorId: string
): Promise<Club> => {
  try {
    // Generate club ID
    const clubRef = doc(collection(db, 'clubs'));
    const clubId = clubRef.id;
    
    // Generate unique slug
    let slug = generateSlug(clubData.name || '');
    let slugExists = true;
    let counter = 0;
    
    // Check if slug exists and make it unique
    while (slugExists) {
      const slugQuery = query(collection(db, 'clubs'), where('nameSlug', '==', slug));
      const slugDocs = await getDocs(slugQuery);
      
      if (slugDocs.empty) {
        slugExists = false;
      } else {
        counter++;
        slug = `${generateSlug(clubData.name || '')}-${counter}`;
      }
    }
    
    // Create club document
    const newClub: Omit<Club, 'id'> = {
      name: clubData.name || '',
      nameSlug: slug,
      sport: clubData.sport || 'other',
      status: 'trial', // Start with trial status
      subscription: {
        plan: 'free',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        memberLimit: 50
      },
      profile: {
        logo: '',
        coverImage: '',
        description: clubData.profile?.description || '',
        established: clubData.profile?.established || new Date(),
        registration: clubData.profile?.registration || {
          type: 'society',
          number: ''
        }
      },
      contact: {
        phone: clubData.contact?.phone || '',
        email: clubData.contact?.email || '',
        whatsapp: clubData.contact?.whatsapp || clubData.contact?.phone || '',
        ...(clubData.contact?.website && { website: clubData.contact.website })
      },
      address: {
        line1: clubData.address?.line1 || '',
        ...(clubData.address?.line2 && { line2: clubData.address.line2 }),
        city: clubData.address?.city || '',
        state: clubData.address?.state || 'WP Kuala Lumpur',
        postcode: clubData.address?.postcode || '',
        country: 'Malaysia' as const,
        ...(clubData.address?.coordinates && { coordinates: clubData.address.coordinates })
      },
      settings: {
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
        languages: ['en'],
        fiscalYearStart: 1 // January
      },
      operatingHours: {
        monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        sunday: { isOpen: true, openTime: '08:00', closeTime: '20:00' }
      },
      features: {
        payments: true,
        tournaments: true,
        coaching: true,
        merchandise: false
      },
      stats: {
        totalMembers: 0,
        activeMembers: 0,
        monthlyRevenue: 0,
        facilities: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: creatorId
    };
    
    await setDoc(clubRef, newClub);
    
    // Add creator as the first admin member
    const memberRef = doc(collection(db, 'clubs', clubId, 'members'));
    const newMember: ClubMember = {
      id: memberRef.id,
      userId: creatorId,
      clubId: clubId,
      role: 'admin',
      permissions: ['all'],
      joinedAt: new Date(),
      status: 'active'
    };
    
    await setDoc(memberRef, newMember);
    
    // Update club stats
    await updateDoc(clubRef, {
      'stats.totalMembers': 1,
      'stats.activeMembers': 1
    });
    
    return { id: clubId, ...newClub };
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

// Get club by ID
export const getClubById = async (clubId: string): Promise<Club | null> => {
  try {
    const clubDoc = await getDoc(doc(db, 'clubs', clubId));
    
    if (clubDoc.exists()) {
      return { id: clubDoc.id, ...clubDoc.data() } as Club;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching club:', error);
    return null;
  }
};

// Get clubs for a user
export const getUserClubs = async (userId: string): Promise<Club[]> => {
  try {
    const clubs: Club[] = [];
    
    // Query all clubs to find member subcollections
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));
    
    for (const clubDoc of clubsSnapshot.docs) {
      // Check if user is a member of this club
      const memberQuery = query(
        collection(db, 'clubs', clubDoc.id, 'members'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      
      const memberSnapshot = await getDocs(memberQuery);
      
      if (!memberSnapshot.empty) {
        clubs.push({ id: clubDoc.id, ...clubDoc.data() } as Club);
      }
    }
    
    return clubs;
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return [];
  }
};

// Update club
export const updateClub = async (
  clubId: string, 
  updates: Partial<Club>
): Promise<void> => {
  try {
    const clubRef = doc(db, 'clubs', clubId);
    
    await updateDoc(clubRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating club:', error);
    throw error;
  }
};

// Get club member
export const getClubMember = async (
  clubId: string, 
  userId: string
): Promise<ClubMember | null> => {
  try {
    const memberQuery = query(
      collection(db, 'clubs', clubId, 'members'),
      where('userId', '==', userId)
    );
    
    const memberSnapshot = await getDocs(memberQuery);
    
    if (!memberSnapshot.empty) {
      const memberDoc = memberSnapshot.docs[0];
      return { id: memberDoc.id, ...memberDoc.data() } as ClubMember;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching club member:', error);
    return null;
  }
};

// Check if user can perform action in club
export const canUserPerformAction = async (
  clubId: string,
  userId: string,
  action: string
): Promise<boolean> => {
  const member = await getClubMember(clubId, userId);
  
  if (!member || member.status !== 'active') {
    return false;
  }
  
  // Admins and owners can do everything
  if (member.role === 'admin' || member.role === 'owner') {
    return true;
  }
  
  // Check specific permissions
  return member.permissions.includes(action) || member.permissions.includes('all');
};

// Get all club members
export const getClubMembers = async (
  clubId: string
): Promise<ClubMember[]> => {
  try {
    const membersQuery = query(
      collection(db, 'clubs', clubId, 'members'),
      where('status', '==', 'active'),
      orderBy('joinedAt', 'desc')
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    const members: ClubMember[] = [];
    
    for (const doc of membersSnapshot.docs) {
      members.push({ id: doc.id, ...doc.data() } as ClubMember);
    }
    
    return members;
  } catch (error) {
    console.error('Error fetching club members:', error);
    return [];
  }
};

// Get member details with user info
export const getMemberWithUserInfo = async (
  clubId: string,
  memberId: string
): Promise<{ member: ClubMember; userInfo: User } | null> => {
  try {
    const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', memberId));
    
    if (!memberDoc.exists()) {
      return null;
    }
    
    const member = { id: memberDoc.id, ...memberDoc.data() } as ClubMember;
    
    // Get user info
    const userDoc = await getDoc(doc(db, 'users', member.userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userInfo = { id: userDoc.id, ...userDoc.data() } as User;
    
    return { member, userInfo };
  } catch (error) {
    console.error('Error fetching member with user info:', error);
    return null;
  }
};

// Update member role or permissions
export const updateClubMember = async (
  clubId: string,
  memberId: string,
  updates: Partial<ClubMember>
): Promise<void> => {
  try {
    const memberRef = doc(db, 'clubs', clubId, 'members', memberId);
    
    await updateDoc(memberRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating club member:', error);
    throw error;
  }
};

// Remove member from club (soft delete - changes status to inactive)
export const removeClubMember = async (
  clubId: string,
  memberId: string
): Promise<void> => {
  try {
    await updateClubMember(clubId, memberId, {
      status: 'inactive',
      leftAt: new Date()
    });
    
    // Update club stats
    const club = await getClubById(clubId);
    if (club) {
      await updateDoc(doc(db, 'clubs', clubId), {
        'stats.totalMembers': club.stats.totalMembers - 1,
        'stats.activeMembers': club.stats.activeMembers - 1
      });
    }
  } catch (error) {
    console.error('Error removing club member:', error);
    throw error;
  }
};

// Generate invitation code
export const generateInvitationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create club invitation
export const createClubInvitation = async (
  clubId: string,
  invitationData: {
    email: string;
    role: ClubMember['role'];
    message?: string;
    expiresIn?: number; // days
  }
): Promise<string> => {
  try {
    const code = generateInvitationCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (invitationData.expiresIn || 7));
    
    const invitationRef = doc(collection(db, 'clubs', clubId, 'invitations'));
    
    await setDoc(invitationRef, {
      code,
      email: invitationData.email,
      role: invitationData.role,
      message: invitationData.message || '',
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      usedAt: null,
      usedBy: null
    });
    
    return code;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
};

// Get pending invitations for a club
export const getClubInvitations = async (
  clubId: string
): Promise<any[]> => {
  try {
    const invitationsQuery = query(
      collection(db, 'clubs', clubId, 'invitations'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(invitationsQuery);
    const invitations: any[] = [];
    
    snapshot.forEach(doc => {
      invitations.push({ id: doc.id, ...doc.data() });
    });
    
    return invitations;
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
};

// Accept invitation and join club
export const acceptInvitation = async (
  clubId: string,
  invitationCode: string,
  userId: string
): Promise<boolean> => {
  try {
    // Find invitation by code
    const invitationQuery = query(
      collection(db, 'clubs', clubId, 'invitations'),
      where('code', '==', invitationCode),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(invitationQuery);
    
    if (snapshot.empty) {
      return false;
    }
    
    const invitationDoc = snapshot.docs[0];
    const invitation = invitationDoc.data();
    
    // Check if invitation is expired
    if (invitation.expiresAt.toDate() < new Date()) {
      return false;
    }
    
    // Add user as member
    const memberRef = doc(collection(db, 'clubs', clubId, 'members'));
    await setDoc(memberRef, {
      userId,
      clubId,
      role: invitation.role || 'member',
      permissions: invitation.role === 'admin' ? ['all'] : ['view'],
      joinedAt: new Date(),
      status: 'active',
      invitedBy: invitation.createdBy || null
    });
    
    // Update invitation status
    await updateDoc(doc(db, 'clubs', clubId, 'invitations', invitationDoc.id), {
      status: 'used',
      usedAt: new Date(),
      usedBy: userId
    });
    
    // Update club stats
    const club = await getClubById(clubId);
    if (club) {
      await updateDoc(doc(db, 'clubs', clubId), {
        'stats.totalMembers': club.stats.totalMembers + 1,
        'stats.activeMembers': club.stats.activeMembers + 1
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
};