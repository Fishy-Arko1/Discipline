# Environment Variables Guide

## Backend Environment Variables

### File: `backend/.env`

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/discipline_tracker?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### Variable Explanations

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | Secret key for JWT encoding (⚠️ CHANGE IN PRODUCTION) | `your_secret_key` |
| `JWT_EXPIRE` | JWT token expiration time | `7d`, `24h`, `7200s` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Production Values

For production deployment:

```ini
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/discipline_tracker
JWT_SECRET=use_a_strong_random_string_generate_with_openssl_rand_hex_32
JWT_EXPIRE=7d
CLIENT_URL=https://yourdomain.com
```

## Frontend Environment Variables

### File: `frontend/.env`

```ini
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### Variable Explanations

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

### Production Values

```ini
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## How to Generate JWT_SECRET

### Using OpenSSL (Recommended)
```bash
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
```

### Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using Python
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env` files to Git** - Add to `.gitignore`
2. **Use strong JWT_SECRET** - At least 32 characters
3. **Change defaults in production** - Don't use example values
4. **Use HTTPS in production** - Never use HTTP for sensitive data
5. **Rotate secrets periodically** - Update JWT_SECRET every 6 months
6. **Use environment variable manager** - Consider using services like:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - GitHub Secrets (for CI/CD)

## Deployment Platforms

### Vercel (Frontend)
Set environment variables in Vercel dashboard

### Railway (Backend)
```bash
railway link
railway variables
# Add your env vars in the Railway dashboard
```

### Heroku (Backend)
```bash
heroku config:set MONGODB_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret_key
```

## Troubleshooting

### MongoDB Connection Issues
- Verify username and password don't have special characters
- URL-encode special characters: `@` → `%40`, `:` → `%3A`
- Check IP whitelist in MongoDB Atlas
- Test connection string manually

### JWT Issues
- Ensure JWT_SECRET is set
- Check token expiration with: `jwt.verify(token, secret)`
- Clear old tokens if secret changed

### CORS Issues
- Verify CLIENT_URL matches frontend domain
- Check backend server is running
- Clear browser cache and cookies
