// This file is for server-side Firebase Admin SDK operations
// It will be used in API routes and server components

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
const initAdmin = () => {
  if (getApps().length === 0) {
    // In production, use service account credentials
    // For now, we'll use environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('Firebase project ID not configured');
    }

    const app = initializeApp({
      projectId,
      // In production, add service account credentials here
      // credential: cert({
      //   projectId: process.env.FIREBASE_PROJECT_ID,
      //   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      //   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      // }),
    });

    return app;
  }
  
  return getApps()[0];
};

// Export admin services
export const getAdminAuth = () => {
  const app = initAdmin();
  return getAuth(app);
};

export const getAdminFirestore = () => {
  const app = initAdmin();
  return getFirestore(app);
};

export const getAdminStorage = () => {
  const app = initAdmin();
  return getStorage(app);
};

// Helper functions for common admin operations

// Set custom claims for a user (e.g., admin role)
export const setCustomUserClaims = async (uid: string, claims: Record<string, any>) => {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, claims);
};

// Verify ID token on server
export const verifyIdToken = async (token: string) => {
  const auth = getAdminAuth();
  return auth.verifyIdToken(token);
};

// Create a custom token for authentication
export const createCustomToken = async (uid: string, claims?: Record<string, any>) => {
  const auth = getAdminAuth();
  return auth.createCustomToken(uid, claims);
};