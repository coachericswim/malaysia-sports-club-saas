'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaContainer: string) => Promise<ConfirmationResult>;
  confirmPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Ensure id is included
        return { ...data, id: uid } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Create user document in Firestore
  const createUserDocument = async (
    uid: string, 
    email: string, 
    additionalData: Partial<User>
  ): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    
    const defaultUserData: User = {
      id: uid,
      email,
      profile: {
        firstName: additionalData.profile?.firstName || '',
        lastName: additionalData.profile?.lastName || '',
        displayName: additionalData.profile?.displayName || email.split('@')[0],
        nationality: additionalData.profile?.nationality || 'Malaysian',
        identificationType: additionalData.profile?.identificationType || 'ic',
        identificationNumber: additionalData.profile?.identificationNumber || '',
        ...additionalData.profile
      },
      auth: {
        role: 'member',
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastLogin: new Date(),
        loginCount: 1,
        ...additionalData.auth
      },
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          whatsapp: true,
          push: true
        },
        privacy: {
          showProfile: true,
          showStats: true
        },
        ...additionalData.preferences
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        ...additionalData.metadata
      }
    };

    await setDoc(userRef, defaultUserData);
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Try to fetch user data with retries for new users
        let userData = await fetchUserData(firebaseUser.uid);
        let retries = 0;
        
        // If user data doesn't exist yet, retry a few times (for new registrations)
        while (!userData && retries < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          userData = await fetchUserData(firebaseUser.uid);
          retries++;
        }
        
        if (userData) {
          setCurrentUser(userData);
          // Update last login
          try {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              'auth.lastLogin': new Date(),
              'auth.loginCount': (userData.auth.loginCount || 0) + 1,
              'metadata.lastActive': new Date()
            });
          } catch (error) {
            console.error('Error updating login info:', error);
          }
        } else {
          console.error('User document not found after retries for:', firebaseUser.uid);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user.uid);
      if (!userData) {
        throw new Error('User data not found');
      }
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Register new user
  const register = async (
    email: string, 
    password: string, 
    userData: Partial<User>
  ) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name in Firebase Auth
      if (userData.profile?.displayName) {
        await updateProfile(result.user, {
          displayName: userData.profile.displayName
        });
      }
      
      // Create user document in Firestore
      await createUserDocument(result.user.uid, email, userData);
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      // Wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!firebaseUser || !currentUser) return;
    
    try {
      setError(null);
      
      // Update Firebase Auth profile if display name changed
      if (data.profile?.displayName && data.profile.displayName !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, {
          displayName: data.profile.displayName
        });
      }
      
      // Update Firestore document
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        ...data,
        'metadata.updatedAt': new Date()
      });
      
      // Update local state
      const updatedUser = await fetchUserData(firebaseUser.uid);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (!firebaseUser) return;
    
    try {
      setError(null);
      await sendEmailVerification(firebaseUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userData = await fetchUserData(result.user.uid);
      if (!userData) {
        // Create new user document
        await createUserDocument(result.user.uid, result.user.email!, {
          profile: {
            displayName: result.user.displayName || undefined,
            photoURL: result.user.photoURL || undefined
          }
        });
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with phone number
  const signInWithPhone = async (phoneNumber: string, recaptchaContainer: string) => {
    try {
      setError(null);
      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: 'invisible'
      });
      
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      
      return confirmationResult;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Confirm phone verification code
  const confirmPhoneCode = async (
    confirmationResult: ConfirmationResult, 
    code: string
  ) => {
    try {
      setError(null);
      const result = await confirmationResult.confirm(code);
      
      // Check if user document exists
      const userData = await fetchUserData(result.user.uid);
      if (!userData) {
        // Create new user document with phone number
        await createUserDocument(result.user.uid, '', {
          phone: result.user.phoneNumber || undefined,
          auth: {
            phoneVerified: true
          }
        });
      } else {
        // Update phone verification status
        await updateDoc(doc(db, 'users', result.user.uid), {
          phone: result.user.phoneNumber,
          'auth.phoneVerified': true,
          'metadata.updatedAt': new Date()
        });
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Update email
  const updateUserEmail = async (newEmail: string, password: string) => {
    if (!firebaseUser || !firebaseUser.email) return;
    
    try {
      setError(null);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, password);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Update email
      await updateEmail(firebaseUser, newEmail);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        email: newEmail,
        'metadata.updatedAt': new Date()
      });
      
      // Send verification email to new address
      await sendEmailVerification(firebaseUser);
      
      // Refresh user data
      const updatedUser = await fetchUserData(firebaseUser.uid);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Update password
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser || !firebaseUser.email) return;
    
    try {
      setError(null);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Update password
      await updatePassword(firebaseUser, newPassword);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    firebaseUser,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    sendVerificationEmail,
    signInWithGoogle,
    signInWithPhone,
    confirmPhoneCode,
    updateUserEmail,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};