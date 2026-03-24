# Deployment Guide - Discipline Tracker

## 🚀 Deployment Options

### 1. Frontend Deployment

#### Option A: Vercel (Recommended - Free, Fast)

1. **Prepare your code**
```bash
cd frontend
npm run build
```

2. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

3. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Add New" → "Project"
- Import your GitHub repository
- Select `frontend` as root directory
- Add environment variables:
  - `REACT_APP_API_URL` = your backend URL
- Click "Deploy"

4. **Your app is live!** 🎉

#### Option B: Netlify

1. **Build locally**
```bash
cd frontend
npm run build
```

2. **Deploy**
- Go to [netlify.com](https://netlify.com)
- Drag and drop the `frontend/dist` folder
- Or connect GitHub for auto-deploy

3. **Add environment variables**
- Site settings → Build & deploy → Environment
- Add `REACT_APP_API_URL`

#### Option C: GitHub Pages

1. **Add to `vite.config.js`**
```javascript
export default {
  base: '/discipline-tracker/'
}
```

2. **Deploy**
```bash
npm run build
# Push dist folder to gh-pages branch
```

### 2. Backend Deployment

#### Option A: Railway (Recommended - Simple)

1. **Create Railway account** - [railway.app](https://railway.app)

2. **Push to GitHub**
```bash
git add .
git commit -m "Backend ready"
git push origin main
```

3. **Deploy on Railway**
- Click "New Project"
- Select "GitHub Repo"
- Choose `backend` folder
- Add MongoDB Atlas URI as environment variable
- Add other env vars

4. **Get your API URL** from Railway dashboard

#### Option B: Heroku

```bash
# Install Heroku CLI
npm install -g heroku
heroku login

# Create app
heroku create your-app-name

# Add buildpack for Node.js
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set MONGODB_URI="your_connection_string"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set CLIENT_URL="https://yourdomain.com"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option C: AWS (Scalable but Complex)

1. **Create EC2 instance** (Ubuntu t3.micro)
2. **Install Node.js and MongoDB driver**
3. **Clone your repo**
4. **Set environment variables**
5. **Use PM2 to manage process**
6. **Set up Nginx as reverse proxy**
7. **Use SSL certificate (Let's Encrypt)**

### 3. Database Setup

#### MongoDB Atlas (Cloud - Recommended)

Already set up! Just ensure:
- IP whitelist includes your server IP
- Connection string in environment variables
- Regular backups enabled

#### MongoDB Community Edition (Self-hosted)

```bash
# Install on Ubuntu
sudo apt-get install -y mongodb

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/discipline_tracker
```

## 📋 Pre-Deployment Checklist

### Frontend
- [ ] Build locally and test: `npm run build && npm run preview`
- [ ] Update API URL in environment
- [ ] Test all features work
- [ ] Check console for errors
- [ ] Verify dark mode works
- [ ] Test on mobile devices
- [ ] PWA manifest is correct
- [ ] Service worker loads

### Backend
- [ ] All environment variables set
- [ ] MongoDB connection tested
- [ ] CORS origins correct
- [ ] JWT_SECRET is secure and random
- [ ] NODE_ENV=production
- [ ] Error handling working
- [ ] Database backups configured
- [ ] Rate limiting added

## 🔐 Security for Production

### HTTPS/SSL

**Vercel**: Automatic ✅
**Netlify**: Automatic ✅
**Railway**: Automatic ✅

**Manual Setup (Using Let's Encrypt)**:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### Environment Security

```bash
# Never commit .env
echo ".env" >> .gitignore

# Use secret management
# GitHub Actions, Vercel, Railway all have built-in secret stores
```

### Rate Limiting (Express)

Add to backend `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📊 Monitoring

### Error Tracking

Use **Sentry**:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

- **Frontend**: Use Vercel Analytics or Lighthouse
- **Backend**: Use New Relic or DataDog

### Logs

**Vercel**: Built-in logs in dashboard
**Railway**: Real-time logs in dashboard
**Heroku**: `heroku logs --tail`

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install & Build Frontend
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy Frontend
      run: npm run deploy:frontend
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    
    - name: Deploy Backend
      run: npm run deploy:backend
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📈 Scaling

### As User Base Grows

1. **Database Optimization**
   - Add indexes
   - Archive old data
   - Consider sharding

2. **Backend Optimization**
   - Add caching (Redis)
   - API rate limiting
   - Load balancing

3. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - CDN for static files

4. **Infrastructure**
   - Use auto-scaling
   - Add load balancer
   - Database read replicas

## 🆘 Deployment Troubleshooting

### Build Fails
- Check Node version matches
- Run `npm install` again
- Check for circular dependencies

### Runtime Errors
- Check environment variables
- Review server logs
- Test locally first

### Database Connection
- Verify IP whitelist
- Check connection string
- Test credentials

### CORS Issues
- Verify frontend URL matches CLIENT_URL
- Check allowed headers
- Clear browser cache

## 📞 Support & Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Express Deployment: https://expressjs.com/en/advanced/best-practice-performance.html
- React Deployment: https://create-react-app.dev/deployment/

---

**Deployment Complete! Monitor your apps regularly. 🚀**
