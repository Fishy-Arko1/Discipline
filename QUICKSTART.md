# Quick Start Guide - Discipline Tracker

## ⚡ 5-Minute Setup

### Prerequisites Check
```bash
node --version  # Should be v16+
npm --version   # Should be v7+
```

### 1. Backend Setup (Terminal/PowerShell)

```bash
cd backend
npm install
```

**Create `.env` file** with:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/discipline_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Start backend:**
```bash
npm run dev
```

You should see: `Server running on port 5000`

### 2. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

You should see: `Local:   http://localhost:3000`

### 3. Access Application

Open browser: **http://localhost:3000**

## 🔑 MongoDB Atlas Setup (If Not Done)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Start Free"
3. Create account
4. Create M0 (Free) cluster
5. Add IP: 0.0.0.0/0 (for development)
6. Create database user (remember username/password)
7. Click "Connect" → "Drivers" → Copy connection string
8. Paste into `.env` file replacing `<username>` and `<password>`

## 📱 Test the Application

1. **Sign Up**: Create account with test email
2. **Dashboard**: Should show today's trackers
3. **Mark Wake Time**: Click button, select time, save
4. **Add Water**: Click water buttons
5. **Study Hours**: Enter hours for both sessions
6. **Custom Goals**: Add a new goal
7. **Analytics**: View your progress

## 🎨 Features to Try

### Quick Actions
- ← Day navigation arrows
- 🌙 Dark mode toggle
- 📊 View analytics

### Trackers
- ⏰ Wake-up time with comparison to 6 AM
- 📚 Study hours with progress bar
- 💧 Water intake with quick add buttons
- ❤️ No masturbation habit toggle

## 🔧 Useful Commands

```bash
# Backend
npm run dev        # Start with auto-reload
npm start         # Start production

# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview build
```

## 🐛 If Something Goes Wrong

**Backend won't start:**
- Check if port 5000 is in use: `lsof -i :5000` (Mac/Linux)
- Check MongoDB connection string in .env
- Check Node.js version: `node --version`

**Frontend won't start:**
- Delete `node_modules` and `.package-lock.json`
- Run `npm install` again
- Clear port 3000: `lsof -i :3000` and `kill -9 <PID>`

**Data not showing:**
- Check browser console (F12)
- Check terminal for errors
- Verify .env variables are set
- MongoDB IP whitelist allows your connection

## 📚 Key Files

- `backend/src/server.js` - Backend entry point
- `frontend/src/App.jsx` - Frontend entry point
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

## 🚀 Next Steps

1. Customize goals to your needs
2. Set up MongoDB backup
3. Read full README.md for deployment options
4. Explore analytics features
5. Modify colors/branding in components

---

**Need help?** Check the main README.md or troubleshooting section.

**Happy tracking! 💪**
