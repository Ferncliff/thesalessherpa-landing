# 🚀 TheSalesSherpa Deployment Guide

**Deploy to thesalessherpa.ai for February 17th VP Sales Demo**

## 🎯 Quick Start (Development)

```bash
# 1. Install dependencies
./install.sh

# 2. Start development server
./start.sh dev

# 3. Access the platform
open http://localhost:3000
```

## 🌐 Production Deployment to thesalessherpa.ai

### Prerequisites

- Domain: thesalessherpa.ai (configured)
- Server: Ubuntu 20.04+ with Node.js 18+
- SSL Certificate (Let's Encrypt)
- Reverse proxy (Nginx)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Application Deployment

```bash
# Clone repository
git clone <repository-url> /var/www/thesalessherpa
cd /var/www/thesalessherpa

# Install dependencies
./install.sh

# Build production assets
cd src/client
npm run build

# Set up environment
cp .env.example .env.production
# Edit .env.production with production settings
```

### Step 3: Nginx Configuration

Create `/etc/nginx/sites-available/thesalessherpa.ai`:

```nginx
server {
    listen 80;
    server_name thesalessherpa.ai www.thesalessherpa.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thesalessherpa.ai www.thesalessherpa.ai;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/thesalessherpa.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thesalessherpa.ai/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }
    
    # Static files
    location / {
        root /var/www/thesalessherpa/src/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Step 4: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d thesalessherpa.ai -d www.thesalessherpa.ai

# Enable auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 5: Start Production Services

```bash
# Enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Start application with PM2
cd /var/www/thesalessherpa
pm2 start src/server/app.js --name "thesalessherpa-api"
pm2 startup
pm2 save
```

## 🎭 Demo Configuration

### Environment Variables for Demo

```bash
# .env.production
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://thesalessherpa.ai

# Demo data for VP Sales demo
DEMO_MODE=true
DEMO_ACCOUNTS=wpp,battelle,salesforce

# Salesforce (demo/sandbox)
SALESFORCE_CLIENT_ID=demo_client_id
SALESFORCE_CLIENT_SECRET=demo_client_secret
```

### Pre-Demo Checklist

- [ ] Platform deployed to https://thesalessherpa.ai
- [ ] SSL certificate working
- [ ] Demo data loaded (WPP, Battelle, Salesforce accounts)
- [ ] All API endpoints responding
- [ ] Salesforce export functionality tested
- [ ] Relationship mapping displays correctly
- [ ] Urgency scores calculated properly
- [ ] Mobile responsive design working

## 📊 Monitoring & Health Checks

```bash
# Check application status
pm2 status

# View logs
pm2 logs thesalessherpa-api

# Health check endpoint
curl https://thesalessherpa.ai/health

# API test
curl https://thesalessherpa.ai/api/accounts
```

## 🔧 Troubleshooting

### Common Issues

1. **Port 5001 conflicts**: Change PORT in .env.production
2. **Nginx 502 errors**: Check if Node.js app is running
3. **SSL issues**: Verify certificate paths in Nginx config
4. **API CORS errors**: Update FRONTEND_URL in environment

### Log Locations

- Application logs: `pm2 logs`
- Nginx access: `/var/log/nginx/access.log`
- Nginx errors: `/var/log/nginx/error.log`

## 🎯 February 17th Demo Preparation

### Day Before (Feb 16)

- [ ] Final deployment to thesalessherpa.ai
- [ ] Load fresh demo data
- [ ] Test all critical paths
- [ ] Backup current state
- [ ] Prepare contingency plan

### Demo Day (Feb 17)

- [ ] Verify platform is accessible
- [ ] Check demo accounts display correctly
- [ ] Test Salesforce export
- [ ] Confirm relationship mapping
- [ ] Have local backup ready

## 🚀 Post-Demo Scaling

After successful VP Sales demo, prepare for:

- Production database (MongoDB Atlas)
- Real Salesforce integration
- User authentication
- Multi-tenant architecture
- Performance monitoring
- Automated backups

---

**Contact:** Matt Edwards | matt.edwards@fadv.com  
**Platform:** TheSalesSherpa.ai  
**Demo Date:** February 17, 2026, 1:30 PM