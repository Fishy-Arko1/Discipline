# Discipline Tracker - Architecture & Database Schema

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  (React App with Service Worker - PWA enabled)              │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/WebSocket
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                    Frontend (Vite + React)                  │
│  - Components (Dashboard, Trackers, Analytics)              │
│  - Service Worker (Caching, Offline support)                │
│  - Tailwind CSS (Styling)                                   │
│  - Recharts (Charts)                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API (Axios)
                   │ http://localhost:5000/api
┌──────────────────┴──────────────────────────────────────────┐
│                  Backend (Node.js + Express)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes (Auth, Logs, Goals)                            │ │
│  │  Controllers (Business Logic)                          │ │
│  │  Middleware (JWT Auth, CORS)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │ MongoDB Driver
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                 Database (MongoDB Atlas)                    │
│  - Users Collection                                         │
│  - DailyLogs Collection                                     │
│  - Goals Collection                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed with bcrypt),
  name: String (required),
  createdAt: Date,
  
  // Indexes
  indexes: [
    { email: 1 } // unique
  ]
}
```

### DailyLogs Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  date: Date, // Normalized to 00:00:00
  
  wakeUpTime: {
    plannedTime: String, // "06:00" (24h format)
    actualTime: String,  // "06:15" (24h format)
    status: String,      // "not-marked", "on-time", "late"
    lateMinutes: Number  // minutes after 6:00 AM
  },
  
  studyHours: {
    session1: {
      planned: Number,    // 4
      actual: Number,     // hours studied
      completed: Boolean  // actual >= planned
    },
    session2: {
      planned: Number,    // 4
      actual: Number,
      completed: Boolean
    },
    totalHours: Number // session1.actual + session2.actual
  },
  
  waterIntake: {
    goal: Number,        // 6000 ml
    actual: Number,      // total ml consumed
    count: Number        // number of additions
  },
  
  habits: {
    noMasturbation: Boolean // daily toggle
  },
  
  customGoals: [
    {
      goalId: ObjectId (ref: Goals),
      completed: Boolean
    }
  ],
  
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  indexes: [
    { userId: 1, date: 1 } // compound for quick lookups
  ]
}
```

### Goals Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  
  title: String (required),
  description: String,
  type: String, // "daily", "weekly", "monthly"
  category: String, // "health", "study", "habit", "fitness", "personal", "other"
  
  target: {
    value: Number,  // e.g., 30
    unit: String    // "pages", "km", "hours", etc.
  },
  
  priority: String, // "low", "medium", "high"
  active: Boolean,  // soft delete with active flag
  
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  indexes: [
    { userId: 1, active: 1 } // for fetching user's active goals
  ]
}
```

## 🔄 Data Flow

### 1. User Registration
```
User Input → Signup Component
         ↓
    POST /api/auth/signup
         ↓
     Validate Input
         ↓
   Hash Password (Bcrypt)
         ↓
  Create User in DB
         ↓
  Generate JWT Token
         ↓
  Store Token in localStorage
         ↓
    Redirect to Dashboard
```

### 2. Daily Log Creation
```
User Opens Dashboard
         ↓
  Check Today's Date
         ↓
GET /api/logs/log?date=today
         ↓
  Log Exists?
   YES → Display existing log
   NO → Create new log with defaults
         ↓
   Display Dashboard with data
```

### 3. Update Wake Time
```
User Clicks "Mark Time"
         ↓
  Select Time from Input
         ↓
  PUT /api/logs/wake-up
         ↓
  Compare with 6:00 AM
         ↓
  Calculate lateMinutes
         ↓
  Update log in DB
         ↓
  Validate JWT Token
         ↓
  Return updated log
         ↓
  Update UI with new status
```

### 4. Analytics Calculation

```
User Visits Analytics
         ↓
GET /api/logs/analytics?startDate=...&endDate=...
         ↓
  Fetch logs for date range
         ↓
  Calculate:
  - totalDays
  - wakeUpOnTime (count status = "on-time")
  - studyCompleted (count totalHours >= 8)
  - waterGoalMet (count actual >= 6000)
  - habitStreak (consecutive days with noMasturbation = true)
  - averageStudyHours (sum / count)
  - averageWaterIntake (sum / count)
         ↓
  Return analytics object
         ↓
  Generate Charts (Recharts)
         ↓
  Display on UI
```

## 🔐 Authentication Flow

```
    Browser                          Backend
       │                               │
       ├─ POST /auth/login ──────────→ │
       │  {email, password}            │
       │                               ├─ Hash provided password
       │                               ├─ Compare with stored hash
       │                               ├─ Match?
       │                         NO←──┤
       │  {success: false}             │
       │←─────────────────────────────┤
       │                               │
       │                         YES───┤
       │                               ├─ Generate JWT
       │  {token, user}                │
       │←─ ───────────────────────────┤
       │                               │
       ├─ Store token in localStorage  │
       │                               │
       ├─ GET /api/logs/log ──────────→ │
       │  Header: Authorization: Bearer <token>
       │                               ├─ Verify JWT
       │                               ├─ Valid?
       │                         NO←──┤
       │  {success: false, 401}        │
       │←─────────────────────────────┤
       │                               │
       │                         YES───┤
       │                               ├─ Extract userId from token
       │                               ├─ Fetch user's logs
       │  {logs}                       │
       │←─ ───────────────────────────┤
```

## 📈 Performance Optimization

### Database Indexes
```javascript
// DailyLogs - Fast date-based queries
db.dailylogs.createIndex({ userId: 1, date: 1 })

// Goals - Fast active goals retrieval
db.goals.createIndex({ userId: 1, active: 1 })

// Users - Unique email lookup
db.users.createIndex({ email: 1 }, { unique: true })
```

### Query Optimization
```javascript
// Instead of fetching all data:
// ❌ db.dailylogs.find({ userId })

// Use specific fields:
// ✅ db.dailylogs.find(
//      { userId, date: { $gte, $lte }},
//      { projection: { wakeUpTime: 1, date: 1 }}
//    )
```

### Caching Strategy
```
Frontend Cache (Service Worker)
    ↓
    Cache static assets (CSS, JS, images)
    Cache API calls with fallback
    
Backend Cache (Optional - Redis)
    ↓
    Cache analytics calculations
    Cache user goals list
    Cache popular aggregations
```

## 🔀 API Versioning Strategy

For future updates, structure APIs as:
```
/api/v1/auth/login
/api/v1/logs/log
/api/v1/goals

/api/v2/... (future improvements)
```

## 📡 Real-time Features (Future)

Consider adding:
```javascript
// Socket.IO for real-time updates
const socketIO = require('socket.io');

socket.on('logUpdated', (updatedLog) => {
  // Broadcast to user's other devices
});

// Mobile notifications
socket.emit('reminderNotification', {
  title: 'Water intake reminder',
  time: '11:00 AM'
});
```

---

**Understanding the architecture helps with scaling and maintenance! 🏗️**
