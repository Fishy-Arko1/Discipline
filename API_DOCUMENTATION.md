// API Response Format Documentation

/**
 * ==========================================
 * AUTHENTICATION ENDPOINTS
 * ==========================================
 */

// POST /api/auth/signup
/*
REQUEST:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

RESPONSE (Success - 201):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

RESPONSE (Error):
{
  "success": false,
  "message": "User already exists"
}
*/

// POST /api/auth/login
/*
REQUEST:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

RESPONSE (Success - 200):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
*/

// GET /api/auth/me (Requires Authorization header)
/*
RESPONSE (Success - 200):
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-03-24T10:00:00Z"
  }
}
*/

/**
 * ==========================================
 * DAILY LOG ENDPOINTS
 * ==========================================
 */

// GET /api/logs/log?date=YYYY-MM-DD
/*
RESPONSE (Success - 200):
{
  "success": true,
  "log": {
    "_id": "log_id",
    "userId": "user_id",
    "date": "2024-03-24T00:00:00Z",
    "wakeUpTime": {
      "plannedTime": "06:00",
      "actualTime": "06:15",
      "status": "late",
      "lateMinutes": 15
    },
    "studyHours": {
      "session1": {
        "planned": 4,
        "actual": 3.5,
        "completed": false
      },
      "session2": {
        "planned": 4,
        "actual": 0,
        "completed": false
      },
      "totalHours": 3.5
    },
    "waterIntake": {
      "goal": 6000,
      "actual": 2500,
      "count": 2
    },
    "habits": {
      "noMasturbation": true
    },
    "customGoals": [],
    "notes": ""
  }
}
*/

// PUT /api/logs/wake-up
/*
REQUEST:
{
  "actualTime": "06:30",
  "date": "2024-03-24"
}

RESPONSE (Success - 200):
{
  "success": true,
  "log": { ...log object }
}
*/

// POST /api/logs/water
/*
REQUEST:
{
  "amount": 250,
  "date": "2024-03-24"
}

RESPONSE (Success - 200):
{
  "success": true,
  "log": { ...log object with updated waterIntake }
}
*/

// PUT /api/logs/study
/*
REQUEST:
{
  "session": 1,
  "hours": 3.5,
  "date": "2024-03-24"
}

RESPONSE (Success - 200):
{
  "success": true,
  "log": { ...log object with updated study hours }
}
*/

// PUT /api/logs/habit
/*
REQUEST:
{
  "habit": "noMasturbation",
  "value": true,
  "date": "2024-03-24"
}

RESPONSE (Success - 200):
{
  "success": true,
  "log": { ...log object with updated habits }
}
*/

// GET /api/logs/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
/*
RESPONSE (Success - 200):
{
  "success": true,
  "analytics": {
    "totalDays": 7,
    "wakeUpOnTime": 5,
    "studyCompleted": 4,
    "waterGoalMet": 3,
    "habitStreak": 6,
    "averageStudyHours": 7.2,
    "averageWaterIntake": 5200,
    "logs": [ ...array of daily logs ]
  }
}
*/

/**
 * ==========================================
 * GOALS ENDPOINTS
 * ==========================================
 */

// POST /api/goals
/*
REQUEST:
{
  "title": "Read 30 pages",
  "description": "Read daily book",
  "type": "daily",
  "category": "personal",
  "priority": "high",
  "target": {
    "value": 30,
    "unit": "pages"
  }
}

RESPONSE (Success - 201):
{
  "success": true,
  "goal": {
    "_id": "goal_id",
    "userId": "user_id",
    "title": "Read 30 pages",
    "description": "Read daily book",
    "type": "daily",
    "category": "personal",
    "priority": "high",
    "target": {
      "value": 30,
      "unit": "pages"
    },
    "active": true,
    "createdAt": "2024-03-24T10:00:00Z"
  }
}
*/

// GET /api/goals
/*
RESPONSE (Success - 200):
{
  "success": true,
  "goals": [ ...array of goal objects ]
}
*/

// PUT /api/goals/:id
/*
REQUEST:
{
  "title": "Read 40 pages",
  "priority": "medium"
}

RESPONSE (Success - 200):
{
  "success": true,
  "goal": { ...updated goal object }
}
*/

// DELETE /api/goals/:id
/*
RESPONSE (Success - 200):
{
  "success": true,
  "message": "Goal deleted",
  "goal": { ...goal object with active: false }
}
*/

/**
 * ==========================================
 * ERROR RESPONSES
 * ==========================================
 */

/*
400 Bad Request:
{
  "success": false,
  "message": "Please provide email, password, and name"
}

401 Unauthorized:
{
  "success": false,
  "message": "Not authorized to access this route"
}

404 Not Found:
{
  "success": false,
  "message": "Goal not found"
}

500 Internal Server Error:
{
  "success": false,
  "message": "Internal server error message"
}
*/

/**
 * ==========================================
 * RESPONSE HEADERS
 * ==========================================
 */

/*
Content-Type: application/json
Authorization: Bearer <jwt_token>
Access-Control-Allow-Origin: http://localhost:3000
*/
