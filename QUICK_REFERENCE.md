# Quick Reference - Malaysian Sports Club SaaS

## 🔑 Test Accounts & Data

### Test User
- **Email**: test@test.com
- **User ID**: 9UqIw2FXaiS4pi9AZoeNwXtHFwM2
- **Role**: member (update to 'superadmin' in Firestore for admin access)

### Test Club
- **Name**: SAY
- **ID**: 5mghLWRqL9xGsZrOrw0Y
- **Type**: Swimming
- **Location**: Bukit Jalil, WP Kuala Lumpur

## 🚀 Development Commands

```bash
# Start dev server
npm run dev

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Add UI components
npx shadcn@latest add [component-name]
```

## 📁 Key Files

### Configuration
- `.env.local` - Environment variables (Firebase keys)
- `firebase.json` - Firebase project config
- `firestore.rules` - Security rules
- `storage.rules` - Storage security rules

### Core Services
- `/src/lib/services/clubService.ts` - Club CRUD operations
- `/src/contexts/AuthContext.tsx` - Authentication provider
- `/src/types/index.ts` - All TypeScript types

### Main Pages
- `/src/app/page.tsx` - Landing page
- `/src/app/dashboard/page.tsx` - User dashboard
- `/src/app/profile/page.tsx` - User profile
- `/src/app/clubs/create/page.tsx` - Create club
- `/src/app/clubs/[clubId]/page.tsx` - Club dashboard (NEEDS TO BE CREATED)

## 🔧 Firebase Console Links

- **Project**: https://console.firebase.google.com/project/sport-saas
- **Firestore**: https://console.firebase.google.com/project/sport-saas/firestore
- **Authentication**: https://console.firebase.google.com/project/sport-saas/authentication

## 📊 Current Progress

- **Phase 1**: ✅ Project Setup (100%)
- **Phase 2**: ✅ Authentication System (100%)
- **Phase 3**: 🚧 Core Club Management (20%)
  - ✅ Club creation
  - ✅ Dashboard integration
  - ⏳ Club dashboard page (NEXT)
  - ⏳ Member management
  - ⏳ Club settings

## 🐛 Common Issues & Solutions

### Permission Errors
- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Ensure user is authenticated
- Check if user has correct role in club members collection

### 404 Errors
- Club dashboard page not created yet: `/clubs/[clubId]/page.tsx`
- Other dynamic routes may need to be created

### Authentication Issues
- Check `.env.local` has correct Firebase keys
- Ensure Firebase Auth methods are enabled in console
- User document must exist in Firestore

## 🎯 Next Steps

1. Create club dashboard page (`/src/app/clubs/[clubId]/page.tsx`)
2. Add member management UI
3. Implement member invitation system
4. Build club settings page
5. Add facility/court management