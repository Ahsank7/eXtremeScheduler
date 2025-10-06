# Deployment Guide for Service Provider Attendance Portal

## 🔧 Current Setup

### Development
- **Proxy**: `setupProxy.js` forwards `/api/*` to `https://localhost:7094`
- **Environment**: Uses `enviroment.js` with direct URL
- **CORS**: Handled by proxy (no CORS issues)

### Production Issues
- ❌ `setupProxy.js` doesn't work in production builds
- ❌ Static environment files don't auto-switch
- ❌ CORS issues will occur with direct API calls

## 🚀 Deployment Solutions

### Option 1: Environment Variables (Recommended)

Create these files in your project root:

#### `.env.development`
```bash
REACT_APP_API_URL=https://localhost:7094/api/
REACT_APP_ENVIRONMENT=development
```

#### `.env.production`
```bash
REACT_APP_API_URL=https://schedulerapi-demo-bbedcye9htd5ajfg.centralindia-01.azurewebsites.net/api/
REACT_APP_ENVIRONMENT=production
```

#### `.env.local` (for local overrides)
```bash
REACT_APP_API_URL=https://localhost:7094/api/
```

### Option 2: Build-time Environment Selection

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:dev": "REACT_APP_API_URL=https://localhost:7094/api/ react-scripts build",
    "build:prod": "REACT_APP_API_URL=https://schedulerapi-demo-bbedcye9htd5ajfg.centralindia-01.azurewebsites.net/api/ react-scripts build"
  }
}
```

### Option 3: Server-side Proxy (Production)

If you have control over the web server:

#### Nginx Configuration
```nginx
location /api/ {
    proxy_pass https://schedulerapi-demo-bbedcye9htd5ajfg.centralindia-01.azurewebsites.net/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Apache Configuration
```apache
ProxyPass /api/ https://schedulerapi-demo-bbedcye9htd5ajfg.centralindia-01.azurewebsites.net/api/
ProxyPassReverse /api/ https://schedulerapi-demo-bbedcye9htd5ajfg.centralindia-01.azurewebsites.net/api/
```

## 📋 Deployment Checklist

### Before Deployment
- [ ] Set up environment variables
- [ ] Configure CORS on backend for production domain
- [ ] Test API connectivity
- [ ] Update `enviroment.js` to use environment variables

### After Deployment
- [ ] Verify API calls work
- [ ] Test attendance portal functionality
- [ ] Check mobile responsiveness
- [ ] Verify logout functionality

## 🔍 Troubleshooting

### CORS Errors in Production
- **Solution**: Configure CORS on backend to allow your production domain
- **Backend**: Add your production domain to CORS origins

### Environment Variables Not Working
- **Check**: Variables must start with `REACT_APP_`
- **Restart**: Development server after adding new variables
- **Build**: Production builds include environment variables

### API Connection Issues
- **Check**: Network connectivity to backend
- **Verify**: Backend is running and accessible
- **Test**: Direct API calls from browser

## 🎯 Recommended Approach

1. **Use Environment Variables** (Option 1)
2. **Configure Backend CORS** for production domain
3. **Test thoroughly** before going live
4. **Monitor** for any CORS or connectivity issues

This approach provides the most flexibility and follows React best practices.
