# Complete Feature Documentation - Malaysian Sports Club SaaS

## 🎯 Single-Club Focus

This system is designed for individual sports clubs. Each deployment serves ONE club only. All features below are for managing a single sports organization (e.g., "Shah Alam Badminton Academy" OR "KL Warriors Football Club").

## 📋 Table of Contents

1. [Member Management](#member-management)
2. [Payment System](#payment-system)
3. [Scheduling & Booking](#scheduling--booking)
4. [Communication Hub](#communication-hub)
5. [Tournament Management](#tournament-management)
6. [Analytics & Reports](#analytics--reports)
7. [Mobile Features](#mobile-features)
8. [Admin Controls](#admin-controls)

## 👥 Member Management

### Digital Member Registration

#### Features
- **Photo Upload**: Members upload profile pictures during registration
- **Document Verification**: IC/Passport upload for verification
- **Auto-generated Member ID**: Unique QR code for each member
- **Membership Tiers**: Junior, Senior, Premium, VIP

#### How It Works
1. Admin sends invitation link/code to prospective member
2. New member clicks link and fills registration form
3. Uploads required documents
4. Admin reviews and approves
5. Member automatically added to THE club
6. Digital membership card generated with QR code

#### Screenshots
- Registration form with multi-step wizard
- Digital membership card on mobile
- Admin approval dashboard

### Member Directory

#### Search & Filter Options
- By name, member ID, phone number
- By membership tier
- By training group/level
- By payment status
- By join date

#### Member Profiles Include
- Personal information
- Emergency contacts
- Medical conditions/allergies
- Training history
- Payment records
- Attendance statistics

### Attendance Tracking

#### QR Code Check-in
```
Member arrives → Scans QR code → Attendance recorded → Stats updated
```

#### Manual Check-in
- Coach can mark attendance on tablet/phone
- Bulk attendance for group sessions
- Late arrival notifications

## 💳 Payment System

### Malaysian Payment Methods

#### DuitNow QR Integration
- **Auto-generated QR codes** for each invoice
- **Instant payment confirmation** via webhook
- **Support for all Malaysian banks**

#### FPX Online Banking
- Direct integration with 19 Malaysian banks
- Real-time payment status
- Automatic receipt generation

#### Credit/Debit Cards
- Visa, Mastercard, AMEX
- Recurring payments for memberships
- Save card for future use

### Fee Management

#### Types of Fees
1. **Membership Fees**
   - Monthly: RM 50-200
   - Annual: RM 500-2000
   - Family packages available

2. **Training Fees**
   - Per session: RM 20-50
   - Monthly packages: RM 150-400
   - Private coaching: RM 80-150/hour

3. **Tournament Fees**
   - Registration: RM 30-100
   - Late registration surcharge
   - Team discounts

#### Automated Invoicing
- Generated on 1st of each month
- Email and WhatsApp delivery
- Payment reminders (7, 3, 1 day before due)
- Overdue notifications

### Payment Tracking Dashboard

#### Admin View
- Total revenue by month/year
- Outstanding payments list
- Payment method breakdown
- Member payment history
- Export to Excel/PDF

#### Member View
- Payment history
- Upcoming dues
- Download receipts
- Update payment methods

## 📅 Scheduling & Booking

### Training Session Management

#### Coach Features
- Create recurring sessions
- Set capacity limits
- Define skill levels
- Add session notes
- Cancel with notifications

#### Member Features
- View weekly/monthly schedule
- Filter by coach/level
- Register for sessions
- Waitlist functionality
- Calendar sync

### Court/Field Booking

#### Booking Rules
- Advance booking: 7 days
- Maximum duration: 2 hours
- Peak/off-peak pricing
- Member priority booking

#### Booking Process
1. Select date and time
2. Choose court/field
3. Add players (optional)
4. Confirm and pay
5. Receive confirmation

#### Conflict Resolution
- Double-booking prevention
- Admin override capability
- Automatic refunds for cancellations

### Calendar Integration

#### Google Calendar Sync
- Two-way synchronization
- Color-coded by activity type
- Reminder notifications
- Location with map links

#### Export Options
- Download as PDF
- Email weekly schedules
- Print monthly calendar
- Share via WhatsApp

## 💬 Communication Hub

### Announcement System

#### Types of Announcements
1. **Club-wide**: All members
2. **Team-specific**: Selected groups
3. **Urgent**: Push notifications
4. **Events**: Tournament updates

#### Delivery Channels
- In-app notifications
- Email
- WhatsApp broadcast
- SMS (optional)

### Team Chat Features

#### Group Chats
- Auto-created for teams
- Coach as admin
- File/photo sharing
- Message pinning
- Member tagging

#### Direct Messages
- Member to member
- Member to coach
- Admin broadcast
- Read receipts

### WhatsApp Integration

#### Business API Features
- Automated welcome messages
- Payment confirmations
- Booking reminders
- Tournament updates
- Two-way communication

#### Message Templates
```
Welcome: "Hi [Name]! Welcome to [Club Name]. Your member ID is [ID]."
Payment: "Payment of RM[Amount] received. Thank you!"
Reminder: "Training tomorrow at [Time]. See you at [Venue]!"
```

## 🏆 Tournament Management

### Tournament Creation

#### Tournament Types
1. **Single Elimination**
   - Best for quick tournaments
   - Automatic bracket progression
   - Third-place playoff option

2. **Double Elimination**
   - More games for participants
   - Losers bracket
   - Fair competition

3. **Round Robin**
   - Everyone plays everyone
   - Points-based ranking
   - Tiebreaker rules

4. **Swiss System**
   - Balanced matchmaking
   - No elimination
   - Ranking by points

### Registration Management

#### Player Registration
- Online form with payment
- Skill level declaration
- Partner selection (doubles)
- T-shirt size selection
- Dietary requirements

#### Registration Limits
- Early bird pricing
- Maximum participants
- Waitlist management
- Age categories
- Skill divisions

### Live Tournament Features

#### Score Updates
- Real-time scoring by referees
- Mobile app for score entry
- Live leaderboard
- Match statistics

#### Bracket Display
- TV/projector display mode
- Mobile-friendly view
- Automatic progression
- Next match notifications

### Results & Statistics

#### Tournament Reports
- Final rankings
- Prize money distribution
- Player statistics
- Match summaries
- Photo galleries

#### Player Profiles
- Tournament history
- Win/loss records
- Rankings
- Achievements
- Performance trends

## 📊 Analytics & Reports

### Member Analytics

#### Key Metrics
- Total active members
- New registrations/month
- Retention rate
- Attendance trends
- Popular time slots

#### Demographic Insights
- Age distribution
- Gender breakdown
- Location heatmap
- Sport preferences
- Membership tier distribution

### Financial Reports

#### Revenue Analytics
- Monthly recurring revenue
- Payment method analysis
- Outstanding payments
- Revenue by category
- Year-over-year growth

#### Expense Tracking
- Coach payments
- Facility costs
- Equipment purchases
- Tournament expenses
- Operational costs

### Custom Reports

#### Export Options
- PDF reports
- Excel spreadsheets
- CSV data files
- Email scheduled reports
- Print-friendly formats

## 📱 Mobile Features

### Progressive Web App (PWA)

#### Offline Capabilities
- View schedules offline
- Access member directory
- Check payment history
- Read announcements
- Sync when online

#### Mobile-First Design
- Touch-optimized interface
- Swipe gestures
- Bottom navigation
- Large tap targets
- Responsive layouts

### Push Notifications

#### Notification Types
- Payment reminders
- Booking confirmations
- Schedule changes
- Tournament updates
- Emergency announcements

#### User Preferences
- Notification toggles
- Quiet hours setting
- Channel selection
- Frequency controls

## 🔧 Admin Controls

### User Management

#### Role-Based Access
1. **Super Admin**
   - Full system access
   - Billing management
   - System configuration

2. **Club Admin**
   - Member management
   - Financial oversight
   - Content control

3. **Coach**
   - Session management
   - Attendance tracking
   - Member communication

4. **Staff**
   - Check-in desk
   - Basic reporting
   - Limited access

### System Configuration

#### Club Settings
- Logo and branding
- Operating hours
- Facility details
- Payment methods
- Tax configuration

#### Automation Rules
- Payment reminders
- Booking confirmations
- Birthday greetings
- Membership renewals
- Overdue notifications

### Security Features

#### Access Control
- Two-factor authentication
- IP whitelisting
- Session management
- Audit logs
- Permission matrices

#### Data Protection
- Encrypted storage
- Secure backups
- PDPA compliance
- Data retention policies
- Member data export

## 🎯 Upcoming Features (Roadmap)

### Q1 2025
- [ ] AI-powered court allocation
- [ ] Wearable device integration
- [ ] Advanced analytics dashboard
- [ ] Multi-club management

### Q2 2025
- [ ] Video coaching tools
- [ ] Sponsorship management
- [ ] Equipment rental system
- [ ] Loyalty rewards program

### Q3 2025
- [ ] National ranking system
- [ ] Inter-club tournaments
- [ ] Performance tracking
- [ ] Nutrition planning

### Q4 2025
- [ ] VR training modules
- [ ] Blockchain certificates
- [ ] Global club network
- [ ] Olympic pathway tracking

---

📚 For detailed implementation guides, see our [Development Documentation](DEVELOPMENT/)