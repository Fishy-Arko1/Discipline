# 🎉 Getting Started - Discipline Tracker

Welcome to your complete **Discipline Tracker** application! This guide will get you running in minutes.

## ⚡ Start Here - Choose Your Path

### 🏃 Super Quick (2 minutes)
**If you just want to see it working:**

**Windows:**
```bash
cd tracker
.\setup.bat
```

**macOS/Linux:**
```bash
cd tracker
chmod +x setup.sh
./setup.sh
```

Then follow the on-screen instructions!

### 📖 Detailed Setup (10 minutes)
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Follow step-by-step instructions
3. Test all features

### 🚀 Production Deployment
Read [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Vercel (Frontend)
- Railway (Backend)
- Heroku (Alternative)

## 📚 Documentation Guide

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [README.md](README.md) | Full project documentation | 10 min |
| [QUICKSTART.md](QUICKSTART.md) | Fast setup guide | 5 min |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API endpoints reference | 5 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & database schema | 10 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment options | 15 min |
| [ENV_GUIDE.md](ENV_GUIDE.md) | Environment variables help | 5 min |
| [TESTING.md](TESTING.md) | Testing checklist | 10 min |
| [PROJECT_FILES.md](PROJECT_FILES.md) | Complete file listing | 5 min |

## 🎯 Core Features at a Glance

```
┌─────────────────────────────────────────────────┐
│         DISCIPLINE TRACKER FEATURES            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⏰ WAKE-UP TRACKING                            │
│     • Mark wake time                            │
│     • Compare with 6 AM target                  │
│     • Show if on-time or late                   │
│                                                 │
│  📚 STUDY HOURS                                 │
│     • Session 1: 4 hours (morning)             │
│     • Session 2: 4 hours (evening)             │
│     • Progress bar to 8-hour goal               │
│                                                 │
│  💧 WATER INTAKE                                │
│     • Quick-add buttons (250ml, 500ml, 1L)     │
│     • Goal: 6 liters per day                    │
│     • Live progress tracking                    │
│                                                 │
│  ❤️  HABIT TRACKING                             │
│     • Yes/No toggles                            │
│     • Daily streak counter                      │
│     • (Example: No Masturbation)                │
│                                                 │
│  🎯 CUSTOM GOALS                                │
│     • Create personal goals                     │
│     • Set priority & category                   │
│     • Track completion                          │
│                                                 │
│  📊 ANALYTICS                                   │
│     • Weekly & monthly reports                  │
│     • Visual charts (study, water)              │
│     • Streak tracking                           │
│                                                 │
│  🌙 DARK MODE                                   │
│     • Toggle day/night theme                    │
│     • Persists preference                       │
│                                                 │
│  📱 PWA SUPPORT                                 │
│     • Install as mobile app                     │
│     • Works offline                             │
│     • Native app experience                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔑 Key Information

### Default Credentials (For Testing)
- **Email:** test@example.com
- **Password:** password123
- Create your own account for actual use

### Important Ports
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **MongoDB:** Cloud-based (MongoDB Atlas)

### First-Time Setup Checklist
- [ ] Node.js v16+ installed
- [ ] MongoDB Atlas account created
- [ ] Environment variables (.env) configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)

## 🚀 Quick Commands

```bash
# Setup (one-time)
cd backend && npm install
cd ../frontend && npm install

# Development (open 2 terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Visit http://localhost:3000 in browser
```

## 🎓 Learn the App

### First Steps
1. **Sign Up** - Create new account
2. **Dashboard** - See today's trackers
3. **Mark Wake Time** - Click button, set time
4. **Add Water** - Click water buttons
5. **Set Study Hours** - Enter hours for sessions
6. **Toggle Habit** - Switch on/off
7. **Create Goal** - Add custom goal
8. **View Analytics** - Check your progress

### Navigation Tips
- Use date arrows to view/edit other days
- 🌙 Toggle for dark mode (top right)
- Analytics accessible from top menu
- Logout button in top right

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure credentials are correct

### "Port 5000/3000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### "Service Worker not working"
- Clear browser cache
- Try incognito/private window
- Check browser console for errors

### More help?
See [TESTING.md](TESTING.md) troubleshooting section

## 📈 What You Can Do With This

✅ **Track Personal Progress**
- Monitor wake-up consistency
- Track study dedication
- Maintain health habits
- Build discipline daily

✅ **Analyze Trends**
- See weekly/monthly patterns
- Calculate averages
- Track streaks
- Measure goal completion

✅ **Customize for Your Needs**
- Create custom daily goals
- Adjust targets
- Add personal habits
- Set priorities

✅ **Use as Mobile App**
- Install on phone like app
- Works offline
- Syncs when back online
- Native app feel

## 🎯 Next Steps

### Immediate
1. Run the app (see Quick Commands above)
2. Create an account
3. Test all features
4. Explore analytics

### Short Term (This Week)
1. Customize with your goals
2. Set your daily routine
3. Start tracking consistently
4. Review analytics

### Medium Term (This Month)
1. Adjust goals based on results
2. Identify patterns
3. Optimize your routine
4. Build discipline

### Long Term (Future Enhancements)
Consider adding:
- Social sharing
- Push notifications
- Mobile app (React Native)
- Advanced AI recommendations
- Team tracking
- Rewards/gamification

## 🤝 Need Help?

### Quick Help
1. Check [QUICKSTART.md](QUICKSTART.md)
2. Look in [README.md](README.md)
3. See [TESTING.md](TESTING.md) for common issues

### Technical Help
1. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Check [ENV_GUIDE.md](ENV_GUIDE.md)

### Deployment
1. See [DEPLOYMENT.md](DEPLOYMENT.md)
2. Choose your platform
3. Follow step-by-step

## 💡 Pro Tips

### For Best Experience
- Use Chrome/Firefox for desktop
- Install as PWA on mobile
- Enable notifications (optional)
- Use dark mode at night
- Review analytics weekly

### For Data
- Edit any past day
- Export before changes
- Regular backups (MongoDB)
- Track trends over time

### For Features
- Custom goals for any metric
- Try different habit toggles
- Experiment with daily goals
- Use analytics insights

## 🚀 Ready?

### To get started NOW:
```bash
cd tracker
# Windows: .\setup.bat
# Mac/Linux: chmod +x setup.sh && ./setup.sh
```

### Or manual setup:
Open [QUICKSTART.md](QUICKSTART.md) and follow step-by-step

---

## 📞 Quick Reference

| Need | File | Section |
|------|------|---------|
| Setup Help | [QUICKSTART.md](QUICKSTART.md) | All sections |
| Environment Vars | [ENV_GUIDE.md](ENV_GUIDE.md) | All sections |
| Deploy to Web | [DEPLOYMENT.md](DEPLOYMENT.md) | All sections |
| API Info | [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Endpoints |
| Test Features | [TESTING.md](TESTING.md) | Manual Testing |
| How It Works | [ARCHITECTURE.md](ARCHITECTURE.md) | Data Flow |

---

**Welcome! Let's build discipline one day at a time! 💪**

Last Updated: March 24, 2026 | Version: 1.0.0
