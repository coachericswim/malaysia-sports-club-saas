// This script updates a user's role to superadmin
// Usage: Update the USER_ID below and run: node scripts/make-admin.js

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'sport-saas',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'sport-saas'
  });
}

const db = admin.firestore();

async function makeUserAdmin(userId) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      'auth.role': 'superadmin',
      'metadata.updatedAt': new Date()
    });
    
    console.log(`✅ Successfully updated user ${userId} to superadmin role`);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    process.exit();
  }
}

// UPDATE THIS WITH YOUR USER ID
const USER_ID = '9UqIw2FXaiS4pi9AZoeNwXtHFwM2';

makeUserAdmin(USER_ID);