# Testing Guide - Discipline Tracker

## 🧪 Testing Checklist

### Authentication Testing

- [ ] Signup with new email
- [ ] Signup with existing email (should fail)
- [ ] Signup with short password (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] JWT token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Logout clears token and redirects to login
- [ ] Protected routes redirect when not authenticated

### Dashboard Testing

- [ ] Dashboard loads with today's date
- [ ] Previous day button works
- [ ] Can't go to future dates
- [ ] Date selector shows correct date
- [ ] "Today" indicator shows only on current date

### Wake-Up Tracker Testing

- [ ] Mark time button works
- [ ] Displays "On Time" for 6:00 AM or earlier
- [ ] Displays late minutes for after 6:00 AM
- [ ] Can edit wake time
- [ ] Status updates correctly
- [ ] Works across different dates
- [ ] Persists data on refresh

### Study Tracker Testing

- [ ] Session 1 input accepts decimal (e.g., 3.5)
- [ ] Session 2 input accepts decimal
- [ ] Total hours calculated correctly
- [ ] Progress bar reaches 100% at 8 hours
- [ ] Progress bar color changes when complete
- [ ] Works across different dates
- [ ] Persists data on refresh

### Water Tracker Testing

- [ ] +250ml button adds 250ml
- [ ] +500ml button adds 500ml
- [ ] +1L button adds 1000ml
- [ ] Multiple clicks accumulate
- [ ] Progress bar shows liters
- [ ] Goal is 6L
- [ ] Progress bar color changes at 100%
- [ ] Works across different dates
- [ ] Persists data on refresh

### Habits Testing

- [ ] Toggle switches between true/false
- [ ] Displays motivational message when true
- [ ] Works across different dates
- [ ] Persists data on refresh

### Goals Testing

- [ ] Add goal button opens form
- [ ] Form has required fields
- [ ] Can create new goal
- [ ] Goal appears in list
- [ ] Can edit goal
- [ ] Can delete goal
- [ ] Delete confirmation dialog
- [ ] Goals persist on refresh
- [ ] Only user's goals show

### Analytics Testing

- [ ] Default to weekly view
- [ ] Can switch to monthly view
- [ ] Stats cards show correct numbers
- [ ] Study hours chart displays bars
- [ ] Water intake chart displays lines
- [ ] Habit streak calculates correctly
- [ ] Average calculations correct
- [ ] Charts responsive on mobile

### UI/UX Testing

- [ ] Dark mode toggle works
- [ ] Dark mode preference persists
- [ ] Mobile responsive
- [ ] Buttons are clickable
- [ ] Form validation working
- [ ] Error messages show
- [ ] Loading states display
- [ ] Smooth transitions
- [ ] Accessibility (WCAG 2.1 AA)

### PWA Testing

- [ ] Service worker installs
- [ ] Can add to home screen
- [ ] Works offline (cached assets)
- [ ] Manifest displays correctly
- [ ] Icons load properly

### Data Persistence

- [ ] Data saves in MongoDB
- [ ] User can't see other users' data
- [ ] Can edit any historical day
- [ ] Deleting old data works
- [ ] Data exports work

## 🧩 Manual Testing Scenarios

### Scenario 1: New User Journey
```
1. Visit app
2. Sign up with new email
3. Verify logged in
4. Mark wake time (late)
5. Add water (3 times)
6. Add study hours (3 hours session 1, 2 hours session 2)
7. Toggle habit (on)
8. Create custom goal
9. Check analytics
10. Verify all data saved
```

### Scenario 2: Multi-Day Tracking
```
1. Log in
2. Day 1: Add all data
3. Navigate to Day 2
4. Add Day 2 data (different values)
5. Navigate back to Day 1
6. Verify Day 1 data unchanged
7. Navigate to Day 3
8. Add Day 3 data
9. Check analytics shows all 3 days
```

### Scenario 3: Edge Cases
```
1. Very early wake time (e.g., 5:00 AM)
2. Very late wake time (e.g., 12:00 PM)
3. Exactly 6:00 AM (on time)
4. 0 hours study
5. 10+ hours study (over goal)
6. 0ml water
7. 10+ liters water
```

### Scenario 4: Offline Testing
```
1. Open app online
2. Navigate to dashboard
3. Go offline (DevTools → Network → Offline)
4. Refresh page
5. Should see cached content
6. Try to add water (should queue)
7. Go back online
8. Verify data syncs
```

## 🔍 Browser DevTools Testing

### Console Check
```javascript
// Check for errors
// No 404s or 500s
// JWT token present
localStorage.getItem('token')

// Check API calls
// Network tab → XHR/Fetch
// 200 status codes
// Correct headers
```

### Performance
```javascript
// Lighthouse score (should be >90)
// Core Web Vitals
// LCP < 2.5s
// FID < 100ms
// CLS < 0.1
```

### Mobile Testing
```
Test on:
- iPhone (Safari)
- Android (Chrome)
- Different screen sizes
- Touch interactions
- Keyboard on mobile
- Orientation changes
```

## 🤖 API Testing (cURL/Postman)

### Signup Test
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Auth API Call
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add Water
```bash
curl -X POST http://localhost:5000/api/logs/water \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 250,
    "date": "2024-03-24"
  }'
```

## 📋 Known Issues & Workarounds

### Issue: Service Worker not updating
**Solution**: 
- Clear cache manually
- Clear service workers
- Do hard refresh (Ctrl+Shift+R)

### Issue: CORS errors on localhost
**Solution**:
- Ensure backend running on :5000
- Check CLIENT_URL in backend .env
- Clear browser cookies

### Issue: MongoDB connection error
**Solution**:
- Check connection string
- Verify IP whitelist
- Test credentials directly

## ✅ Pre-Release Checklist

- [ ] All manual tests pass
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] Error handling tested
- [ ] Edge cases handled
- [ ] Responsive design verified
- [ ] Dark mode works
- [ ] PWA installable
- [ ] Service worker active
- [ ] Analytics calculations correct
- [ ] Data persistence verified
- [ ] Security headers set
- [ ] CORS configured properly
- [ ] Rate limiting active
- [ ] Deployment tested
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Documentation complete

## 🐛 Bug Report Template

```markdown
### Bug Title
[Clear, concise description]

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots/Video
[Attach if applicable]

### Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [Desktop/Mobile]
- App Version: [v1.0.0]

### Additional Context
[Any other relevant info]
```

---

**Thorough testing ensures reliability! Test often, test thoroughly! 🧪**
