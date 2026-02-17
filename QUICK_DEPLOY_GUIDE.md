# 🚀 QUICK DEPLOY: TheSalesSherpa → thesalessherpa.ai

**URGENT: Feb 17 VP Sales Demo Deployment**

## ⚡ 15-MINUTE DEPLOYMENT

### 1. Backend (5 minutes) - Render.com
```bash
1. Open: https://render.com/
2. "New" → "Web Service" 
3. Connect GitHub: ferncliff-workspace-backup
4. Settings:
   - Name: thesalessherpa-api
   - Root Directory: projects/thesalessherpa
   - Build Command: npm install  
   - Start Command: node src/server/app.js
5. Add Environment Variables (from .env.production)
6. Click "Create Web Service"
7. Wait 3-5 minutes for deployment
8. Copy the backend URL (ends with .onrender.com)
```

### 2. Frontend (5 minutes) - Vercel
```bash
1. Open: https://vercel.com/
2. "Add New" → "Project"
3. Import from Git → Select ferncliff-workspace-backup
4. Settings:
   - Root Directory: projects/thesalessherpa/src/client
   - Build Command: npm run build
   - Output Directory: build
5. Environment Variables:
   - REACT_APP_API_URL=[your-render-backend-url]
6. Click "Deploy"
7. Wait 2-3 minutes for build
8. Copy the frontend URL
```

### 3. Domain (5 minutes) - DNS Configuration
```bash
1. In Vercel project dashboard:
   - Settings → Domains
   - Add: thesalessherpa.ai
   - Add: www.thesalessherpa.ai

2. In your DNS provider:
   - CNAME: @ → cname.vercel-dns.com
   - CNAME: www → cname.vercel-dns.com
   
3. Wait 5-30 minutes for DNS propagation
```

## 🎯 DEMO URLs (After Deployment)
- **Production**: https://thesalessherpa.ai
- **API Health**: https://[backend].onrender.com/health
- **Backup**: Direct Vercel/Render URLs if domain issues

## ✅ Files Ready for Deployment
- `src/client/build/` - Production React build ✓
- `src/server/` - Production Node.js API ✓  
- `.env.production` - Environment configuration ✓
- All deployment configs committed to GitHub ✓

## 🚨 If Issues Arise
- Use direct hosting URLs for demo
- Local fallback: `./start.sh dev`
- Screenshots/video backup prepared

**⏱️ Total deployment time: 15-30 minutes**  
**🎯 Demo ready: February 17, 2026!**