# Deployment Guide - Malaysian Sports Club SaaS

## 🚀 Overview

This guide will help you deploy your Malaysian Sports Club SaaS to production using Firebase Hosting. Your app will be accessible worldwide with a custom domain.

## 📋 Pre-Deployment Checklist

### Required Completions
- [ ] Local development is working
- [ ] All environment variables are set
- [ ] Firebase project is configured
- [ ] Stripe account is verified
- [ ] Testing is complete

### Recommended
- [ ] Custom domain purchased (e.g., mysportsclub.com.my)
- [ ] SSL certificate (free with Firebase)
- [ ] Backup of all data

## 🔧 Step 1: Prepare for Production

### 1.1 Update Environment Variables

Create `.env.production` file:

```env
# Firebase Configuration (Same as development)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Stripe Configuration (Use LIVE keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here

# Application Settings (Update URL)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Malaysia Sports Club
```

### 1.2 Update Firebase Security Rules

#### Firestore Rules
Go to Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Club admins can write to their club
    match /clubs/{clubId}/{document=**} {
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.admins;
    }
    
    // Users can update their own profile
    match /users/{userId} {
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

#### Storage Rules
Go to Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can read
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Users can upload their own files
    match /users/{userId}/{allPaths=**} {
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## 🏗️ Step 2: Build for Production

### 2.1 Install Firebase Tools

```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase

```bash
firebase login
```

### 2.3 Initialize Firebase

```bash
firebase init
```

Select:
- Hosting
- Functions (if using)
- Your existing project

### 2.4 Build the Application

```bash
npm run build
```

This creates an optimized production build.

## 🌐 Step 3: Deploy to Firebase Hosting

### 3.1 Deploy

```bash
firebase deploy
```

### 3.2 Verify Deployment

After deployment, you'll see:
```
✔ Deploy complete!
Hosting URL: https://your-project.web.app
```

Visit the URL to confirm deployment.

## 🔗 Step 4: Custom Domain Setup

### 4.1 Add Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain: `mysportsclub.com.my`
4. Follow verification steps

### 4.2 DNS Configuration

Add these records to your domain provider:

```
Type: A
Name: @
Value: 199.36.158.100

Type: A  
Name: @
Value: 199.36.158.100

Type: CNAME
Name: www
Value: your-project.web.app
```

### 4.3 SSL Certificate

Firebase automatically provisions SSL certificate (may take up to 24 hours).

## 💳 Step 5: Stripe Production Setup

### 5.1 Complete Stripe Verification

1. Login to Stripe Dashboard
2. Complete business verification
3. Add Malaysian bank account
4. Enable live mode

### 5.2 Update Webhook Endpoint

1. Go to Stripe → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 5.3 Configure Malaysian Payment Methods

Enable in production:
- Cards
- FPX (Malaysian banks)
- DuitNow QR
- GrabPay

## 📊 Step 6: Monitoring Setup

### 6.1 Firebase Analytics

1. Enable Google Analytics in Firebase
2. Add tracking code to your app
3. Set up conversion tracking

### 6.2 Error Monitoring

```bash
npm install @sentry/nextjs
```

Configure Sentry for error tracking:

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### 6.3 Uptime Monitoring

Set up monitoring with:
- UptimeRobot (free)
- Pingdom
- Firebase Performance Monitoring

## 🔒 Step 7: Security Hardening

### 7.1 Environment Variables

Never commit `.env` files. Use Firebase Functions environment config:

```bash
firebase functions:config:set stripe.secret="sk_live_xxx"
```

### 7.2 Rate Limiting

Add rate limiting to prevent abuse:

```javascript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(request: Request) {
  const ip = request.ip || '127.0.0.1'
  const { success } = await rateLimit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

### 7.3 Content Security Policy

Add CSP headers in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;"
  }
]
```

## 🔄 Step 8: Backup Strategy

### 8.1 Automated Firestore Backup

```bash
# Schedule daily backups
gcloud firestore export gs://your-backup-bucket
```

### 8.2 Storage Backup

Set up Cloud Storage lifecycle rules for automatic backups.

## 📈 Step 9: Performance Optimization

### 9.1 Enable CDN

Firebase Hosting includes global CDN automatically.

### 9.2 Image Optimization

Use Next.js Image component for automatic optimization:

```javascript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Club Logo"
  width={200}
  height={100}
  priority
/>
```

### 9.3 Enable Caching

Configure cache headers in `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      }
    ]
  }
}
```

## 🧪 Step 10: Post-Deployment Testing

### Critical Tests
1. User registration with real email
2. Payment with live Stripe
3. WhatsApp notifications
4. File uploads
5. Mobile responsiveness

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 50 --num 10 https://yourdomain.com
```

## 📱 Step 11: Mobile App Deployment (PWA)

### 11.1 PWA Configuration

Ensure `manifest.json` is properly configured:

```json
{
  "name": "Malaysia Sports Club",
  "short_name": "MySports",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
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

### 11.2 App Store Submission (Optional)

Use TWA (Trusted Web Activity) for Google Play Store submission.

## 🚨 Troubleshooting Production Issues

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check Firebase Hosting dashboard

### Payment Failures
- Verify Stripe live keys
- Check webhook configuration
- Review Stripe logs

### Slow Performance
- Enable Firebase Performance Monitoring
- Check image sizes
- Review Firestore queries

### SSL Certificate Issues
- Firebase handles SSL automatically
- May take up to 24 hours
- Contact Firebase support if persistent

## 📞 Production Support

### Emergency Contacts
- Firebase Support: https://firebase.google.com/support
- Stripe Support: https://support.stripe.com
- Domain Issues: Contact your registrar

### Monitoring Dashboard
Set up a monitoring dashboard with:
- Firebase Console
- Stripe Dashboard
- Google Analytics
- Sentry Error Tracking

## ✅ Launch Checklist

### Pre-Launch
- [ ] All features tested in production
- [ ] SSL certificate active
- [ ] Backup system configured
- [ ] Monitoring enabled
- [ ] Security rules updated

### Launch Day
- [ ] Announce to beta users
- [ ] Monitor error rates
- [ ] Check payment processing
- [ ] Verify email notifications
- [ ] Test mobile experience

### Post-Launch
- [ ] Daily backup verification
- [ ] Weekly performance review
- [ ] Monthly security audit
- [ ] User feedback collection

---

🎉 Congratulations! Your Malaysian Sports Club SaaS is now live and serving clubs across Malaysia!