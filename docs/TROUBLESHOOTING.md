# Troubleshooting Guide - Malaysian Sports Club SaaS

## 🔍 Overview

This guide helps you resolve common issues with the Malaysian Sports Club SaaS platform. Follow the step-by-step solutions for each problem.

## 📋 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Firebase Errors](#firebase-errors)
3. [Payment Problems](#payment-problems)
4. [Authentication Issues](#authentication-issues)
5. [Performance Problems](#performance-problems)
6. [Mobile Issues](#mobile-issues)
7. [Data & Sync Issues](#data--sync-issues)
8. [Deployment Errors](#deployment-errors)

## 💻 Installation Issues

### "npm: command not found"

#### Symptoms
```bash
-bash: npm: command not found
```

#### Solution
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Choose LTS version
3. Restart terminal after installation
4. Verify installation:
```bash
node --version
npm --version
```

### "Module not found" Errors

#### Symptoms
```
Error: Cannot find module '@/components/ui/button'
```

#### Solutions
1. **Clear cache and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

2. **Check import paths**:
- Ensure using `@/` for src imports
- Use relative paths for same directory

3. **Verify tsconfig.json**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Port 3000 Already in Use

#### Symptoms
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solutions
1. **Kill the process**:
```bash
# Mac/Linux
sudo lsof -i :3000
kill -9 <PID>

# Or use
npx kill-port 3000
```

2. **Use different port**:
```bash
PORT=3001 npm run dev
```

## 🔥 Firebase Errors

### "Firebase App not initialized"

#### Symptoms
```
FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created
```

#### Solutions
1. **Check environment variables**:
```bash
# Verify .env.local exists
ls -la | grep .env

# Check if variables are set
echo $NEXT_PUBLIC_FIREBASE_API_KEY
```

2. **Verify Firebase config**:
```javascript
// lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... other config
};

// Log to verify (remove in production)
console.log('Firebase Config:', firebaseConfig);
```

3. **Restart dev server**:
```bash
# Ctrl+C to stop
npm run dev
```

### "Permission Denied" Firestore Error

#### Symptoms
```
FirebaseError: Missing or insufficient permissions
```

#### Solutions
1. **For development**, use test rules:
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. **Check authentication**:
```javascript
// Verify user is logged in
const user = auth.currentUser;
if (!user) {
  console.log('User not authenticated');
}
```

3. **Check Firebase Console**:
- Go to Firestore → Rules
- Ensure rules are published
- Check Rules Playground for testing

### Firebase Quota Exceeded

#### Symptoms
```
Error: Quota exceeded for quota metric 'Read requests'
```

#### Solutions
1. **Check Firebase Console** for usage
2. **Optimize queries**:
```javascript
// Bad: Reading all documents
const allMembers = await getDocs(collection(db, 'members'));

// Good: Paginated query
const membersQuery = query(
  collection(db, 'members'),
  orderBy('createdAt'),
  limit(20)
);
```

3. **Enable offline persistence**:
```javascript
enableIndexedDbPersistence(db).catch((err) => {
  console.log('Offline persistence failed:', err);
});
```

## 💳 Payment Problems

### Stripe "Invalid API Key"

#### Symptoms
```
StripeAuthenticationError: Invalid API Key provided
```

#### Solutions
1. **Verify environment variables**:
```bash
# Check if keys are set
grep STRIPE .env.local
```

2. **Ensure correct key format**:
- Publishable: `pk_test_` or `pk_live_`
- Secret: `sk_test_` or `sk_live_`

3. **Check key usage**:
```javascript
// Frontend (use publishable)
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Backend (use secret)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### Payment Fails with Malaysian Cards

#### Symptoms
- Local cards rejected
- "Card not supported" error

#### Solutions
1. **Enable Malaysian payment methods** in Stripe:
   - Dashboard → Settings → Payment methods
   - Enable: Cards, FPX

2. **Set correct currency**:
```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // RM 100.00
  currency: 'myr', // Malaysian Ringgit
});
```

3. **Test with Malaysian test cards**:
```
Success: 4000 0026 0000 0008
Decline: 4000 0026 0000 0034
```

### DuitNow QR Not Generating

#### Solutions
1. **Check DuitNow credentials**:
```javascript
const duitnowConfig = {
  merchantId: process.env.DUITNOW_MERCHANT_ID,
  secretKey: process.env.DUITNOW_SECRET_KEY,
};
```

2. **Verify QR library**:
```bash
npm install qrcode
```

3. **Test QR generation**:
```javascript
import QRCode from 'qrcode';

const generateQR = async (text) => {
  try {
    const qr = await QRCode.toDataURL(text);
    console.log('QR generated:', qr.substring(0, 50));
  } catch (err) {
    console.error('QR generation failed:', err);
  }
};
```

## 🔐 Authentication Issues

### Login Fails Silently

#### Solutions
1. **Check browser console** for errors
2. **Verify Firebase Auth is enabled**
3. **Test with different sign-in method**:
```javascript
// Email/Password
try {
  const result = await signInWithEmailAndPassword(auth, email, password);
  console.log('Login success:', result.user.uid);
} catch (error) {
  console.error('Login error:', error.code, error.message);
}
```

### "User Not Found" After Registration

#### Solutions
1. **Check Firestore for user document**:
```javascript
const userDoc = await getDoc(doc(db, 'users', uid));
if (!userDoc.exists()) {
  console.log('User document not created');
}
```

2. **Verify user creation trigger**:
```javascript
// After registration
const createUserProfile = async (user) => {
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    createdAt: serverTimestamp(),
    role: 'member'
  });
};
```

### Session Expires Too Quickly

#### Solutions
1. **Implement session persistence**:
```javascript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

setPersistence(auth, browserLocalPersistence);
```

2. **Add token refresh**:
```javascript
// Refresh token every 30 minutes
setInterval(async () => {
  const user = auth.currentUser;
  if (user) {
    await user.getIdToken(true);
  }
}, 30 * 60 * 1000);
```

## ⚡ Performance Problems

### Slow Page Load

#### Solutions
1. **Check bundle size**:
```bash
npm run build
# Check .next/analyze/client.html
```

2. **Implement lazy loading**:
```javascript
// Dynamic imports
const MemberList = dynamic(() => import('@/components/MemberList'), {
  loading: () => <Skeleton />,
});
```

3. **Optimize images**:
```javascript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

### Firestore Queries Slow

#### Solutions
1. **Add composite indexes**:
```javascript
// Check console for index creation links
const slowQuery = query(
  collection(db, 'members'),
  where('clubId', '==', clubId),
  where('status', '==', 'active'),
  orderBy('joinDate', 'desc')
);
```

2. **Implement caching**:
```javascript
// Use React Query or SWR
import useSWR from 'swr';

const { data, error } = useSWR(
  ['members', clubId],
  () => fetchMembers(clubId),
  {
    refreshInterval: 60000, // 1 minute
    revalidateOnFocus: false,
  }
);
```

## 📱 Mobile Issues

### PWA Not Installing

#### Solutions
1. **Check manifest.json**:
```json
{
  "name": "Malaysia Sports Club",
  "short_name": "MySports",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Verify HTTPS** (required for PWA)
3. **Check service worker**:
```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});
```

### Touch Events Not Working

#### Solutions
1. **Add touch event handlers**:
```javascript
const handleTouch = (e) => {
  e.preventDefault();
  // Handle touch
};

<div 
  onTouchStart={handleTouch}
  onClick={handleClick}
>
  Tap me
</div>
```

2. **Increase tap targets**:
```css
.button {
  min-height: 44px; /* iOS recommendation */
  min-width: 44px;
}
```

## 💾 Data & Sync Issues

### Data Not Updating in Real-time

#### Solutions
1. **Implement Firestore listeners**:
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'clubs', clubId),
    (doc) => {
      setClubData(doc.data());
    },
    (error) => {
      console.error('Snapshot error:', error);
    }
  );

  return () => unsubscribe();
}, [clubId]);
```

2. **Check network connectivity**:
```javascript
window.addEventListener('online', () => {
  console.log('Back online');
  // Trigger data refresh
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  // Show offline message
});
```

### Import/Export Failures

#### Solutions
1. **Check file size limits**:
```javascript
// Limit file size to 5MB
const MAX_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  alert('File too large. Maximum 5MB allowed.');
  return;
}
```

2. **Validate CSV format**:
```javascript
import Papa from 'papaparse';

Papa.parse(file, {
  header: true,
  complete: (results) => {
    if (results.errors.length > 0) {
      console.error('CSV errors:', results.errors);
    }
  }
});
```

## 🚀 Deployment Errors

### Build Fails

#### Common errors and solutions:

1. **"Module not found" in production**:
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

2. **Environment variables missing**:
```bash
# Verify all required vars
npm run check-env
```

3. **TypeScript errors**:
```bash
# Check for type errors
npm run type-check
```

### Firebase Deploy Fails

#### Solutions
1. **Login to Firebase**:
```bash
firebase logout
firebase login
```

2. **Select correct project**:
```bash
firebase use --add
# Select your project
```

3. **Check Firebase config**:
```json
// firebase.json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🛠️ Debug Mode

### Enable Debug Logging

1. **Create debug utility**:
```javascript
// utils/debug.js
export const debug = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  }
};
```

2. **Add debug flags**:
```javascript
// .env.local
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=verbose
```

## 📞 Getting Additional Help

### Before Contacting Support

1. **Check browser console** for errors
2. **Review server logs**
3. **Test in incognito mode**
4. **Try different browser**
5. **Check internet connection**

### Information to Provide

When reporting issues, include:
- Error messages (exact text)
- Steps to reproduce
- Browser and version
- Screenshots if applicable
- Time and date of occurrence

### Support Channels

- **Email**: support@malaysportsclub.com
- **WhatsApp**: +60 12-345 6789
- **Response time**: Within 24 hours

---

💡 **Pro Tip**: Keep this guide handy and check it first when encountering issues. Most problems have simple solutions!