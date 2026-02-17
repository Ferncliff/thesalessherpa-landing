#!/bin/bash

# TheSalesSherpa Production Deployment Script
# Deploy to thesalessherpa.ai for February 17 VP Sales Demo

set -e  # Exit on any error

echo "🎯 TheSalesSherpa Production Deployment"
echo "========================================"

# Configuration
DOMAIN="thesalessherpa.ai"
BACKEND_URL="" # Will be set after backend deployment
FRONTEND_BUILD_DIR="src/client/build"

echo "📦 Step 1: Install Dependencies"
echo "--------------------------------"

# Install root dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
else
    echo "Root dependencies already installed ✓"
fi

# Install client dependencies
if [ ! -d "src/client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd src/client && npm install && cd ../..
else
    echo "Client dependencies already installed ✓"
fi

echo "🏗️  Step 2: Build Production Client"
echo "-----------------------------------"

# Build the React application
cd src/client
npm run build
cd ../..

echo "Client build completed ✓"

echo "🚀 Step 3: Backend Deployment Options"
echo "======================================"

echo "BACKEND DEPLOYMENT INSTRUCTIONS:"
echo ""
echo "Option A - Render.com (Recommended):"
echo "1. Go to https://render.com/"
echo "2. Connect GitHub repository"
echo "3. Select 'Web Service'"
echo "4. Root Directory: /"
echo "5. Build Command: npm install"
echo "6. Start Command: node src/server/app.js"
echo "7. Add environment variables from .env.production"
echo ""
echo "Option B - Railway.app:"
echo "1. Go to https://railway.app/"
echo "2. 'Deploy from GitHub repo'"
echo "3. Select repository"
echo "4. Railway will auto-detect Node.js"
echo "5. Add environment variables"
echo ""

echo "🌐 Step 4: Frontend Deployment Options"
echo "======================================="

echo "FRONTEND DEPLOYMENT INSTRUCTIONS:"
echo ""
echo "Option A - Vercel (Recommended):"
echo "1. Go to https://vercel.com/"
echo "2. Import from Git"
echo "3. Root Directory: src/client"
echo "4. Build Command: npm run build"
echo "5. Output Directory: build"
echo "6. Set REACT_APP_API_URL=<backend-url>"
echo ""
echo "Option B - Netlify:"
echo "1. Go to https://netlify.com/"
echo "2. Drag and drop src/client/build folder"
echo "3. Configure custom domain: $DOMAIN"
echo ""

echo "🔧 Step 5: Domain Configuration"
echo "==============================="

echo "DOMAIN SETUP INSTRUCTIONS:"
echo ""
echo "1. In your DNS provider (GoDaddy, Cloudflare, etc):"
echo "   - Add A record: $DOMAIN -> [Frontend IP]"
echo "   - Add CNAME: www.$DOMAIN -> $DOMAIN"
echo "   - Add A record: api.$DOMAIN -> [Backend IP]"
echo ""
echo "2. SSL will be automatically configured by hosting provider"
echo ""

echo "✅ Step 6: Verification Checklist"
echo "================================="

echo "After deployment, verify:"
echo "□ https://$DOMAIN loads successfully"
echo "□ https://api.$DOMAIN/health returns 200"
echo "□ Dashboard displays correctly"
echo "□ Account list loads (WPP, Battelle, Salesforce)"
echo "□ Account details work"
echo "□ Relationship mapping displays"
echo "□ Salesforce export functions"
echo "□ Mobile responsive design"
echo ""

echo "🎭 Demo Preparation Complete!"
echo "============================="
echo ""
echo "🎯 Ready for February 17, 2026 VP Sales Demo!"
echo ""
echo "Built files ready for deployment:"
echo "- Frontend: $FRONTEND_BUILD_DIR"
echo "- Backend: src/server/"
echo "- Config: .env.production"
echo ""
echo "Next steps:"
echo "1. Deploy backend to hosting service"
echo "2. Deploy frontend with backend URL"
echo "3. Configure domain"
echo "4. Test all functionality"
echo ""
echo "🚀 TheSalesSherpa is ready to impress!"