# API Documentation - Malaysian Sports Club SaaS

## 🌐 Overview

This document provides comprehensive API documentation for the Malaysian Sports Club SaaS platform. All API endpoints are RESTful and return JSON responses.

## 🔑 Authentication

### Authentication Methods

#### Firebase Authentication Token
```http
Authorization: Bearer {firebase_id_token}
```

#### API Key (for webhooks)
```http
X-API-Key: {api_key}
```

### Getting Authentication Token

```javascript
// Frontend example
import { auth } from '@/lib/firebase';

const getToken = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return token;
  }
};
```

## 📍 Base URLs

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## 🏢 Club Management APIs

### Get Club Details
```http
GET /api/clubs/{clubId}
```

#### Response
```json
{
  "id": "club_123",
  "name": "KL Badminton Academy",
  "sport": "badminton",
  "address": {
    "line1": "123 Jalan Badminton",
    "line2": "Taman Sukan",
    "city": "Kuala Lumpur",
    "state": "Wilayah Persekutuan",
    "postcode": "50450",
    "country": "Malaysia"
  },
  "contact": {
    "phone": "+60123456789",
    "email": "info@klbadminton.com",
    "whatsapp": "+60123456789"
  },
  "settings": {
    "currency": "MYR",
    "timezone": "Asia/Kuala_Lumpur",
    "language": ["en", "ms", "zh"]
  },
  "createdAt": "2024-01-15T08:00:00Z",
  "memberCount": 245
}
```

### Update Club Settings
```http
PUT /api/clubs/{clubId}/settings
```

#### Request Body
```json
{
  "operatingHours": {
    "monday": { "open": "06:00", "close": "22:00" },
    "tuesday": { "open": "06:00", "close": "22:00" }
  },
  "bookingRules": {
    "advanceBookingDays": 7,
    "maxBookingHours": 2,
    "cancellationHours": 24
  }
}
```

## 👥 Member Management APIs

### List Members
```http
GET /api/clubs/{clubId}/members
```

#### Query Parameters
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)
- `search` (string): Search by name, email, or phone
- `status` (string): active, inactive, suspended
- `tier` (string): junior, senior, premium, vip

#### Response
```json
{
  "members": [
    {
      "id": "member_456",
      "memberNumber": "KLB2024001",
      "profile": {
        "firstName": "Ahmad",
        "lastName": "Rahman",
        "email": "ahmad@email.com",
        "phone": "+60123456789",
        "dateOfBirth": "1990-05-15",
        "gender": "male",
        "photoUrl": "https://storage.example.com/photo.jpg"
      },
      "membership": {
        "tier": "premium",
        "startDate": "2024-01-01",
        "expiryDate": "2024-12-31",
        "status": "active"
      },
      "emergency": {
        "name": "Fatimah Rahman",
        "relationship": "spouse",
        "phone": "+60129876543"
      }
    }
  ],
  "pagination": {
    "total": 245,
    "page": 1,
    "pages": 13,
    "limit": 20
  }
}
```

### Create Member
```http
POST /api/clubs/{clubId}/members
```

#### Request Body
```json
{
  "profile": {
    "firstName": "Ahmad",
    "lastName": "Rahman",
    "email": "ahmad@email.com",
    "phone": "+60123456789",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "icNumber": "900515-10-1234"
  },
  "membership": {
    "tier": "premium",
    "startDate": "2024-01-01"
  },
  "emergency": {
    "name": "Fatimah Rahman",
    "relationship": "spouse",
    "phone": "+60129876543"
  }
}
```

### Update Member
```http
PUT /api/clubs/{clubId}/members/{memberId}
```

### Delete Member
```http
DELETE /api/clubs/{clubId}/members/{memberId}
```

### Member Check-in
```http
POST /api/clubs/{clubId}/members/{memberId}/checkin
```

#### Request Body
```json
{
  "timestamp": "2024-01-20T10:00:00Z",
  "location": "Court 1",
  "activityType": "training",
  "qrCode": "KLB2024001"
}
```

## 💳 Payment APIs

### Create Payment Intent
```http
POST /api/payments/create-intent
```

#### Request Body
```json
{
  "amount": 15000, // In cents (RM 150.00)
  "currency": "myr",
  "type": "membership",
  "metadata": {
    "memberId": "member_456",
    "clubId": "club_123",
    "tier": "premium",
    "period": "monthly"
  }
}
```

#### Response
```json
{
  "clientSecret": "pi_1234567890_secret_abcdef",
  "paymentIntentId": "pi_1234567890",
  "amount": 15000,
  "currency": "myr"
}
```

### Process DuitNow Payment
```http
POST /api/payments/duitnow
```

#### Request Body
```json
{
  "amount": 15000,
  "reference": "INV-2024-001",
  "memberId": "member_456",
  "description": "Monthly membership fee"
}
```

#### Response
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "reference": "INV-2024-001",
  "expiryTime": "2024-01-20T11:00:00Z"
}
```

### Get Payment History
```http
GET /api/clubs/{clubId}/members/{memberId}/payments
```

#### Response
```json
{
  "payments": [
    {
      "id": "pay_789",
      "amount": 15000,
      "currency": "myr",
      "status": "succeeded",
      "method": "card",
      "description": "Monthly membership - January 2024",
      "createdAt": "2024-01-01T00:00:00Z",
      "invoice": {
        "id": "inv_123",
        "url": "https://invoices.stripe.com/inv_123"
      }
    }
  ]
}
```

### Stripe Webhook
```http
POST /api/webhooks/stripe
```

#### Headers
```http
Stripe-Signature: t=1234567890,v1=signature_here
```

#### Event Types Handled
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 📅 Scheduling APIs

### Get Schedule
```http
GET /api/clubs/{clubId}/schedule
```

#### Query Parameters
- `startDate` (date): Start date (YYYY-MM-DD)
- `endDate` (date): End date (YYYY-MM-DD)
- `type` (string): training, tournament, social
- `coach` (string): Coach ID

#### Response
```json
{
  "sessions": [
    {
      "id": "session_123",
      "title": "Beginner Badminton Training",
      "type": "training",
      "coach": {
        "id": "coach_456",
        "name": "Coach Lee"
      },
      "startTime": "2024-01-20T18:00:00Z",
      "endTime": "2024-01-20T20:00:00Z",
      "venue": "Court 1-2",
      "capacity": 20,
      "enrolled": 15,
      "fee": 3000,
      "level": "beginner",
      "status": "confirmed"
    }
  ]
}
```

### Create Session
```http
POST /api/clubs/{clubId}/sessions
```

#### Request Body
```json
{
  "title": "Advanced Badminton Training",
  "type": "training",
  "coachId": "coach_456",
  "startTime": "2024-01-22T18:00:00Z",
  "endTime": "2024-01-22T20:00:00Z",
  "venue": "Court 3-4",
  "capacity": 16,
  "fee": 5000,
  "level": "advanced",
  "recurrence": {
    "frequency": "weekly",
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "endDate": "2024-12-31"
  }
}
```

### Book Session
```http
POST /api/clubs/{clubId}/sessions/{sessionId}/book
```

#### Request Body
```json
{
  "memberId": "member_456",
  "paymentMethod": "membership",
  "notes": "First time attending"
}
```

### Cancel Booking
```http
DELETE /api/clubs/{clubId}/sessions/{sessionId}/bookings/{bookingId}
```

## 🏸 Court/Facility Booking APIs

### Get Available Slots
```http
GET /api/clubs/{clubId}/facilities/availability
```

#### Query Parameters
- `date` (date): Date to check (YYYY-MM-DD)
- `facilityType` (string): court, field, pool
- `duration` (integer): Duration in minutes

#### Response
```json
{
  "facilities": [
    {
      "id": "court_1",
      "name": "Badminton Court 1",
      "type": "court",
      "availableSlots": [
        {
          "startTime": "06:00",
          "endTime": "08:00",
          "price": 6000
        },
        {
          "startTime": "14:00",
          "endTime": "16:00",
          "price": 8000
        }
      ]
    }
  ]
}
```

### Create Facility Booking
```http
POST /api/clubs/{clubId}/facilities/book
```

#### Request Body
```json
{
  "facilityId": "court_1",
  "date": "2024-01-25",
  "startTime": "18:00",
  "endTime": "20:00",
  "memberId": "member_456",
  "players": ["member_789", "member_012"],
  "paymentMethod": "card"
}
```

## 🏆 Tournament APIs

### List Tournaments
```http
GET /api/clubs/{clubId}/tournaments
```

#### Response
```json
{
  "tournaments": [
    {
      "id": "tournament_123",
      "name": "CNY Badminton Championship 2024",
      "type": "single_elimination",
      "sport": "badminton",
      "categories": ["mens_singles", "womens_singles", "mens_doubles"],
      "startDate": "2024-02-10",
      "endDate": "2024-02-11",
      "registrationDeadline": "2024-02-05",
      "fee": 5000,
      "maxParticipants": 64,
      "registered": 48,
      "status": "registration_open"
    }
  ]
}
```

### Register for Tournament
```http
POST /api/tournaments/{tournamentId}/register
```

#### Request Body
```json
{
  "memberId": "member_456",
  "category": "mens_singles",
  "partnerMemberId": null,
  "seedingInfo": {
    "previousRanking": 15,
    "clubRanking": 8
  }
}
```

### Update Match Score
```http
PUT /api/tournaments/{tournamentId}/matches/{matchId}/score
```

#### Request Body
```json
{
  "sets": [
    {
      "player1Score": 21,
      "player2Score": 19
    },
    {
      "player1Score": 21,
      "player2Score": 15
    }
  ],
  "winner": "player1",
  "duration": 2400,
  "referee": "referee_123"
}
```

## 💬 Communication APIs

### Send Announcement
```http
POST /api/clubs/{clubId}/announcements
```

#### Request Body
```json
{
  "title": "Court Maintenance Notice",
  "message": "Courts 1-2 will be closed for maintenance on 25 Jan 2024",
  "type": "maintenance",
  "priority": "high",
  "channels": ["app", "email", "whatsapp"],
  "targetAudience": "all",
  "scheduledTime": "2024-01-24T09:00:00Z"
}
```

### WhatsApp Message
```http
POST /api/communications/whatsapp
```

#### Request Body
```json
{
  "to": "+60123456789",
  "template": "payment_reminder",
  "parameters": {
    "name": "Ahmad",
    "amount": "RM 150.00",
    "dueDate": "25 Jan 2024"
  }
}
```

## 📊 Analytics APIs

### Get Club Analytics
```http
GET /api/clubs/{clubId}/analytics
```

#### Query Parameters
- `period` (string): daily, weekly, monthly, yearly
- `startDate` (date): Start date
- `endDate` (date): End date

#### Response
```json
{
  "members": {
    "total": 245,
    "active": 220,
    "new": 15,
    "churnRate": 2.5
  },
  "revenue": {
    "total": 3850000,
    "membership": 2450000,
    "training": 980000,
    "tournaments": 420000
  },
  "attendance": {
    "average": 85.5,
    "peak": {
      "day": "Wednesday",
      "time": "19:00"
    }
  },
  "facilities": {
    "utilizationRate": 78.5,
    "popularSlots": ["18:00-20:00", "20:00-22:00"]
  }
}
```

## 🔄 Webhooks

### Configure Webhooks
```http
POST /api/admin/webhooks
```

#### Request Body
```json
{
  "url": "https://yourapp.com/webhook",
  "events": ["member.created", "payment.succeeded", "booking.created"],
  "secret": "webhook_secret_key"
}
```

### Webhook Events

#### Member Events
- `member.created`
- `member.updated`
- `member.deleted`
- `member.suspended`

#### Payment Events
- `payment.succeeded`
- `payment.failed`
- `subscription.created`
- `subscription.cancelled`

#### Booking Events
- `booking.created`
- `booking.cancelled`
- `booking.updated`

### Webhook Payload Example
```json
{
  "event": "payment.succeeded",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "paymentId": "pay_123",
    "amount": 15000,
    "memberId": "member_456",
    "description": "Monthly membership"
  }
}
```

## 🔒 Error Responses

### Error Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INVALID_REQUEST`: Invalid request parameters
- `PAYMENT_FAILED`: Payment processing failed
- `BOOKING_CONFLICT`: Double booking attempt
- `RATE_LIMITED`: Too many requests

## 🔐 Rate Limiting

- **Default limit**: 100 requests per minute
- **Authenticated users**: 1000 requests per minute
- **Webhook endpoints**: 10000 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
```

## 🧪 Testing

### Test Environment
- Base URL: `https://test.yourdomain.com/api`
- Use Stripe test cards
- Test phone numbers: +60123456789

### Postman Collection
Download our [Postman Collection](https://postman.com/your-collection) for easy API testing.

---

📚 For implementation examples, see our [SDK Documentation](SDK.md)