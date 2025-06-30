# Firebase Setup Guide for Malaysian Sports Club SaaS

## 🚀 Quick Setup Steps

Follow these steps to set up Firebase for your Malaysian Sports Club SaaS application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `malaysian-sports-club` (or your preferred name)
4. Accept the terms and click **Continue**
5. **Disable Google Analytics** for now (you can enable later)
6. Click **Create Project**

## 2. Enable Authentication

1. In Firebase Console, click **Authentication** in the left sidebar
2. Click **"Get started"**
3. Enable the following sign-in methods:

### Email/Password
- Click **Email/Password**
- Toggle **Enable** to ON
- Click **Save**

### Google Sign-in
- Click **Google**
- Toggle **Enable** to ON
- Add a **Project support email**
- Click **Save**

### Phone (Optional - for Phase 3)
- Click **Phone**
- Toggle **Enable** to ON
- Click **Save**

## 3. Create Firestore Database

1. Click **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **asia-southeast1 (Singapore)** for best Malaysian performance
5. Click **Enable**

## 4. Set Up Firestore Security Rules

1. In Firestore, click on **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clubs - authenticated users can read, only admins can write
    match /clubs/{clubId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.auth.role == 'superadmin';
    }
    
    // Members of a club
    match /clubs/{clubId}/members/{memberId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/clubs/$(clubId)/members/$(request.auth.uid));
    }
  }
}
```

3. Click **Publish**

## 5. Get Configuration Keys

### Web App Configuration

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click **"</>"** (Web) icon
4. Register app with nickname: `Malaysian Sports Club Web`
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

### Service Account (Admin SDK)

1. Go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Save the JSON file securely
4. Extract these values from the JSON:
   - `project_id`
   - `client_email`
   - `private_key`

## 6. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Firebase Client SDK (from firebaseConfig)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=your_client_email_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**: 
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Preserve the `\n` characters in the private key
- Never commit `.env.local` to git

## 7. Enable Additional APIs (Optional)

For full functionality, enable these in [Google Cloud Console](https://console.cloud.google.com/):

1. **Cloud Storage** - for file uploads
2. **Cloud Functions** - for serverless backend
3. **Cloud Scheduler** - for automated tasks

## 8. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/register`

3. Try creating an account

4. Check Firebase Console → Authentication → Users to see if the user was created

## 🎯 Next Steps

Once Firebase is set up:

1. **Test Registration**: Create a test account
2. **Test Login**: Sign in with the test account
3. **Check Firestore**: Verify user document was created
4. **Test Google Sign-in**: Try the Google authentication
5. **Test Password Reset**: Use the forgot password flow

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Double-check your API key in `.env.local`
   - Ensure no extra spaces or quotes

2. **"Missing or insufficient permissions"**
   - Review Firestore security rules
   - Ensure user is authenticated

3. **Google Sign-in not working**
   - Add your domain to authorized domains in Firebase Console
   - For localhost, it should work by default

4. **"auth/unauthorized-domain"**
   - Go to Authentication → Settings → Authorized domains
   - Add `localhost` and your production domain

## 📱 Mobile App Configuration (Future)

When you're ready for mobile apps:

1. **iOS**: Add iOS app in Firebase Console → Download `GoogleService-Info.plist`
2. **Android**: Add Android app → Download `google-services.json`

## 🔒 Security Checklist

- [ ] Enable App Check (prevents abuse)
- [ ] Set up budget alerts in Google Cloud Console
- [ ] Enable 2FA on your Firebase account
- [ ] Regularly review security rules
- [ ] Monitor usage in Firebase Console

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/web/manage-users)

---

Need help? Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) or create an issue in the repository.