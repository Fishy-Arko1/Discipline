# Discipline Tracker - Full Stack Application

A modern, full-stack web application to help users track daily goals and self-improvement habits with real-time analytics and PWA support.

## 🚀 Features

### User Authentication
- Secure signup/login with email & password
- JWT-based authentication
- Bcrypt password hashing
- Private user data isolation

### Dashboard
- **Wake-Up Tracking**: Mark wake-up time, track if on-time or late
- **Study Hours**: Dual session tracker (4+4 hours)
- **Water Intake**: Quick-add buttons (250ml, 500ml, 1L) with progress tracking
- **Habit Tracker**: Yes/No toggles for habits (e.g., No Masturbation)
- **Custom Goals**: Create, edit, delete personalized goals

### Analytics
- Weekly and monthly progress charts
- Study hours trends (bar chart)
- Water intake visualization (line chart)
- Habit streak counter
- Goal completion statistics

### UI/UX
- Dark mode support
- Mobile-first responsive design
- Clean, minimal interface
- Smooth animations and transitions
- Date picker for viewing/editing historical data

### PWA Support
- Installable as mobile app
- Offline-first architecture
- Service worker for caching
- App manifest with icons

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (free tier) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for version control)

## 🛠️ Installation & Setup

### Step 1: Clone/Extract the Project

```bash
cd tracker
npm install
```

### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 free tier)
4. Go to "Network Access" and add your IP or 0.0.0.0/0 (for development)
5. Create a database user with username and password
6. Click "Connect" and copy the connection string
7. Replace `<username>` and `<password>` in the connection string

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your values
```

**Edit `.backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/discipline_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Start the backend server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The backend will run on `http://localhost:5000`

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit if needed (usually works with defaults)
```

**Start the frontend dev server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📱 Using the Application

### First Time Users

1. **Sign Up**: Create an account with email and password
2. **Dashboard**: You'll see today's goals and trackers
3. **Track Goals**: Click buttons to mark wake time, add water, update study hours
4. **Custom Goals**: Add your own goals in the Goals panel
5. **View Analytics**: Check weekly/monthly progress in the Analytics page

### Navigation

- **Dashboard**: Main tracking interface
- **Analytics**: View progress charts and statistics
- **Dark Mode**: Toggle in top right (🌙 icon)
- **Logout**: Top right corner

### Key Features

#### Wake-Up Time
- Click "Mark Time" button
- Select the actual wake-up time
- System compares with 6:00 AM target
- Edit anytime

#### Study Tracker
- Enter hours for Session 1 (Morning)
- Enter hours for Session 2 (Evening)
- Goal: 8 hours total (4+4)
- Progress bar shows percentage

#### Water Tracker
- Click +250ml, +500ml, or +1L buttons
- Goal: 6 liters per day
- Progress bar updates in real-time

#### Habit Tracker
- Toggle "No Masturbation" habit
- Maintains daily streak
- Motivational feedback

#### Custom Goals
- Click "Add Goal" button
- Fill in title, description, category, priority
- Edit or delete existing goals
- Organized by priority and category

#### Date Navigation
- Use arrow buttons to view previous/future days
- Edit any day's data
- Helps with catching up or planning

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Daily Logs
- `GET /api/logs/log?date=YYYY-MM-DD` - Get log for specific date
- `PUT /api/logs/log` - Update daily log
- `PUT /api/logs/wake-up` - Update wake-up time
- `POST /api/logs/water` - Add water intake
- `PUT /api/logs/study` - Update study hours
- `PUT /api/logs/habit` - Update habit status
- `GET /api/logs/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get analytics

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all user goals
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## 🌐 Deployment

### Frontend Deployment (Vercel - Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Set environment variables
5. Deploy

### Backend Deployment (Railway or Heroku)

**Railway:**
1. Push code to GitHub
2. Go to [Railway](https://railway.app)
3. Create new project, connect GitHub
4. Add MongoDB connection string
5. Deploy

**Heroku (with MongoDB Atlas):**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

## 🏗️ Project Structure

```
tracker/
├── backend/
│   ├── src/
│   │   ├── models/           # Database models
│   │   │   ├── User.js
│   │   │   ├── DailyLog.js
│   │   │   └── Goal.js
│   │   ├── controllers/      # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── dailyLogController.js
│   │   │   └── goalController.js
│   │   ├── routes/           # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── dailyLogRoutes.js
│   │   │   └── goalRoutes.js
│   │   ├── middleware/       # Custom middleware
│   │   │   └── auth.js
│   │   └── server.js         # Server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── WakeUpTracker.jsx
│   │   │   ├── StudyTracker.jsx
│   │   │   ├── WaterTracker.jsx
│   │   │   ├── HabitTracker.jsx
│   │   │   ├── GoalsPanel.jsx
│   │   │   └── Analytics.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
```

## 🔐 Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` to a strong, random string
2. Use HTTPS in production
3. Set `NODE_ENV=production`
4. Enable CORS properly (whitelist domains)
5. Use environment variables for sensitive data
6. Implement rate limiting
7. Add input validation
8. Keep dependencies updated

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if IP is whitelisted in MongoDB Atlas
- Verify connection string is correct
- Ensure credentials are escaped properly

### CORS Error
- Check `CLIENT_URL` in backend .env
- Ensure frontend and backend are different ports
- Verify CORS origins are set correctly

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Service Worker Issues
- Clear browser cache
- Check browser console for errors
- Service worker only works on HTTPS or localhost

## 📦 Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (for charts)
- Lucide React (for icons)
- Axios (for API calls)
- Vite (build tool)

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose (ODM)
- JWT (authentication)
- Bcryptjs (password hashing)

**Database:**
- MongoDB Atlas (cloud)

## 🎯 Future Enhancements

- [ ] Social features (share progress, friend streaks)
- [ ] Push notifications for reminders
- [ ] Email notifications
- [ ] Advanced analytics (goals vs actual)
- [ ] Periodic goals (weekly, monthly)
- [ ] Goal templates
- [ ] Export data to PDF/CSV
- [ ] Multiple habit templates
- [ ] Progress photos
- [ ] Rewards/gamification system
- [ ] Mobile app (React Native)

## 📄 License

This project is open-source and available for personal or commercial use.

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review MongoDB Atlas documentation
3. Check backend console logs
4. Check browser console for frontend errors

---

**Happy tracking! Build discipline one day at a time! 💪**

Last Updated: March 2026
#   d i s c i p l i n e - t r a c k e r  
 #   d i s c i p l i n e - t r a c k e r  
 "# discipline-tracker" 
