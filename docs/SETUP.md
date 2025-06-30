# Complete Setup Guide - Malaysian Sports Club SaaS

## 🎯 Overview - Single Club Deployment

This guide will walk you through setting up the management system for YOUR sports club. Each deployment serves ONE club only (e.g., "PJ Badminton Academy"). This is not a multi-club platform - it's YOUR club's dedicated management system.

## 📋 Prerequisites

### Required Accounts (All Free to Start)
1. **Google Account** - For Firebase
2. **Stripe Account** - For payment processing
3. **WhatsApp Business Account** - For messaging (optional)

### Required Software
1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the "LTS" version
   - Run the installer with default settings

2. **Visual Studio Code** (recommended code editor)
   - Download from: https://code.visualstudio.com/
   - Free and easy to use

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Use default installation settings

## 🚀 Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it with YOUR club name: "yourclub-management" (e.g., "pj-badminton-management")
4. Disable Google Analytics (for now)
5. Click "Create Project"

### 1.2 Enable Firebase Services

#### Authentication
1. In Firebase Console, click "Authentication" in left menu
2. Click "Get started"
3. Enable these sign-in methods:
   - Email/Password
   - Google (optional)
   - Phone (for Malaysian +60 numbers)

#### Firestore Database
1. Click "Firestore Database" in left menu
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select location: "asia-southeast1 (Singapore)" for best performance

#### Storage
1. Click "Storage" in left menu
2. Click "Get started"
3. Choose "Start in test mode"
4. Use default location

### 1.3 Get Firebase Configuration

1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the "</>" (Web) icon
4. Register app with nickname: "yourclub-web" (e.g., "pj-badminton-web")
5. Copy the configuration object that appears

## 💳 Step 2: Stripe Setup

### 2.1 Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account with Malaysian business details
3. Complete verification (can test without full verification)

### 2.2 Get API Keys

1. In Stripe Dashboard, click "Developers" → "API keys"
2. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### 2.3 Configure for Malaysia

1. Go to "Settings" → "Payment methods"
2. Enable:
   - Cards
   - FPX (Malaysian online banking)
   - GrabPay (optional)

## 📱 Step 3: WhatsApp Business Setup (Optional)

### 3.1 Facebook Business Account

1. Go to [Facebook Business](https://business.facebook.com/)
2. Create business account
3. Verify your business

### 3.2 WhatsApp Business API

1. Go to [WhatsApp Business API](https://www.facebook.com/business/whatsapp/get-started)
2. Follow setup wizard
3. Get your:
   - Phone number ID
   - Access token

## 🛠️ Step 4: Project Setup

### 4.1 Download Project Code

```bash
# If you have the code in a ZIP file
1. Extract the ZIP file to your desired location
2. Open Terminal/Command Prompt
3. Navigate to the extracted folder:
   cd path/to/malaysia-sports-club-saas
```

### 4.2 Install Dependencies

Open Terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (may take 5-10 minutes).

### 4.3 Environment Variables Setup

1. In the project folder, find `.env.example`
2. Make a copy and rename it to `.env.local`
3. Open `.env.local` in Visual Studio Code
4. Fill in your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# WhatsApp Configuration (Optional)
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Malaysia Sports Club
```

## 🏃 Step 5: Running the Application

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Access the Application

1. Open your web browser
2. Go to: http://localhost:3000
3. You should see the login page!

### 5.3 Create Admin Account

1. Click "Sign Up"
2. Use your email
3. After signup, we need to make you an admin:

```bash
# Run this command to open Firebase Admin tool
npm run make-admin your-email@example.com
```

## 🔧 Step 6: Initial Configuration

### 6.1 Create Your First Club

1. Login with your admin account
2. Go to "Admin Dashboard"
3. Click "Create New Club"
4. Fill in:
   - Club Name
   - Sport Type
   - Address
   - Contact Information

### 6.2 Configure Payment Settings

1. Go to "Settings" → "Payment"
2. Enter your Malaysian bank details
3. Set up membership fees
4. Configure SST (6%)

### 6.3 Set Up DuitNow QR

1. Go to "Settings" → "Payment Methods"
2. Click "Enable DuitNow"
3. Enter your DuitNow merchant details
4. Generate QR code

## 🧪 Step 7: Testing

### 7.1 Test User Registration

1. Open incognito/private browser window
2. Register as a test member
3. Complete payment with test card: `4242 4242 4242 4242`

### 7.2 Test Features

- [ ] Member registration
- [ ] Payment processing
- [ ] Court booking
- [ ] Schedule viewing
- [ ] Announcements

## 🚨 Troubleshooting

### Common Issues

#### "npm: command not found"
- Make sure Node.js is installed
- Restart your terminal after installation

#### "Firebase app not initialized"
- Check your `.env.local` file
- Make sure all Firebase values are filled
- Restart the development server

#### "Stripe payment fails"
- Verify you're using test keys (start with `pk_test_`)
- Check internet connection
- Try the test card: `4242 4242 4242 4242`

#### Port 3000 already in use
```bash
# Kill the process using port 3000
npx kill-port 3000
# Then start again
npm run dev
```

## 📞 Getting Help

### Support Channels
- Email: support@malaysportsclub.com
- WhatsApp: +60 12-345 6789
- Documentation: Check `/docs` folder

### Before Asking for Help
1. Check the error message carefully
2. Look in the Troubleshooting section
3. Try restarting the development server
4. Check your internet connection

## ✅ Next Steps

Once everything is running:

1. Read the [User Guide](USER-GUIDES/admin-guide.md)
2. Customize your club settings
3. Invite test members
4. Configure your domain (see [Deployment Guide](DEPLOYMENT.md))

---

🎉 Congratulations! Your Malaysian Sports Club SaaS is now running locally!