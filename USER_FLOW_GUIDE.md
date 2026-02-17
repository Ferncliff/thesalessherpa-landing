# 🧭 TheSalesSherpa - User Flow Guide

**For Matt Edwards - Testing & Demo Preparation**

---

## 🌐 **Current Access Points**

### **Landing Page**
**URL**: `http://localhost:3000` (development)
**Production**: `https://thesalessherpa.ai` (when deployed)

### **Direct Dashboard Access**
**URL**: `http://localhost:3000/fa/mattedwards` (bypasses landing page)

---

## 👤 **New User Experience**

### **Step 1: Landing Page**
1. **Visit**: `http://localhost:3000`
2. **See**: Professional landing page with sherpa mascot 🧭
3. **Key sections**:
   - Hero: "Your AI Guide Through the Sales Wilderness"
   - Benefits: Relationship Intelligence, Territory Optimization, Seamless Handoffs
   - Demo video placeholder
   - Pricing: $49 Starter / $149 Professional / $399 Enterprise
   - FAQ section

### **Step 2: Get Started Options**
**Multiple CTAs available:**
- **"Start Your Free Trial"** buttons (hero + pricing)
- **"Get Started"** button (navigation)
- **"Watch Demo"** button (hero)
- **Footer link**: "Dashboard" → goes to `/fa/mattedwards`

### **Step 3: Authentication**
When accessing `/fa/mattedwards`, user sees:
- **Loading screen**: "Authenticating..." (brief)
- **Login modal** (if not demo mode)
  - **Email field**: `matt@firstadvantage.com` (example)
  - **Password field**: Any password works in demo mode
  - **Demo note**: "Use any email/password to continue"

### **Step 4: Dashboard Access**
Once authenticated:
- **Main Dashboard**: Your 131 FA territory accounts
- **Navigation**: Accounts, Relationships, Intelligence, etc.
- **Historical Performance**: Prominent banner for 2025 activities

---

## 🎯 **Demo Mode Setup**

### **Current Configuration**
- ✅ **Demo Mode**: Enabled in development
- ✅ **No Real Auth Required**: Any credentials work
- ✅ **Real Data**: Your 131 FA accounts loaded
- ✅ **Historical Data**: 2025 performance tracking

### **Login Credentials (Demo)**
```
Email: ANY email address (matt@firstadvantage.com works)
Password: ANY password (demo123 works)
```

### **Demo Flow Options**

#### **Option A: Landing Page Demo**
1. Start at `http://localhost:3000`
2. Walk through landing page value proposition
3. Click "Start Your Free Trial"
4. Show authentication (any credentials)
5. Enter dashboard with real territory data

#### **Option B: Direct Dashboard Demo**
1. Start at `http://localhost:3000/fa/mattedwards`
2. Show login (any credentials)
3. Jump directly to territory intelligence
4. Focus on data and functionality

---

## 📊 **New Feature: Year Toggle (Historical Activities)**

### **What's New**
- ✅ **Multi-year tracking** - Now shows both 2024 and 2025 data
- ✅ **Year filtering** - Select "2025 Only", "2024 Only", or "All Years"
- ✅ **Column toggles** - Show/hide years with toggle buttons
- ✅ **Visual indicators** - Different colors for each year

### **How to Access**
1. **From Main Dashboard**: Click "View 2025 Activities" banner
2. **URL**: `http://localhost:3000/fa/mattedwards/historical`

### **Demo the Year Toggle**
1. **Start with 2025 data** (default view)
2. **Click "2024" toggle** → Shows 2024 column (green indicators)
3. **Use Year filter** → "All Years" to see combined data
4. **Toggle individual years** → Show/hide columns dynamically

**Key Demo Point**: *"Track outreach history by prospect across multiple years - see patterns and avoid duplicate efforts"*

---

## 🚀 **Quick Start for Immediate Use**

### **For Matt's Real Use**
1. **Start server**: `npm start` (if not already running)
2. **Open browser**: `http://localhost:3000/fa/mattedwards`
3. **Login**: Any credentials (matt@firstadvantage.com / demo123)
4. **Navigate**:
   - **Accounts**: See your 131 real FA prospects
   - **Historical**: Track your 2025 performance 
   - **Intelligence**: Priority actions and insights

### **For Demo Preparation**
1. **Test user flow** from landing page
2. **Practice year toggle** functionality
3. **Verify all 131 accounts** display correctly
4. **Check historical data** shows your activities
5. **Test on mobile** for backup presentation

---

## 🔧 **Technical Details**

### **Environment Setup**
```bash
cd /Users/ferncliffadmin/clawd/projects/thesalessherpa
npm start
```

### **Demo Mode Configuration**
- **File**: `src/client/src/components/ProtectedRoute.js`
- **Demo Mode**: Enabled by default in development
- **No Backend Required**: Works standalone for demo

### **Data Sources**
- **Accounts**: `data/accounts/matt_fa_accounts_formatted.json`
- **Historical**: Built into `HistoricalActivities.tsx` component
- **Dashboard**: `api/intelligence/dashboard.js`

---

## 🎬 **Demo Script Suggestions**

### **New User Onboarding Demo**
> "Let me show you how a new user would discover and access TheSalesSherpa..."

### **Year Toggle Demo**  
> "Here's a powerful feature for tracking prospect history across multiple years. Matt, you can see your 2024 activities here, toggle to 2025, or view them together to identify patterns..."

### **Territory Intelligence Demo**
> "This is Matt's actual First Advantage territory - 131 real accounts with relationship intelligence..."

---

## ⚠️ **Demo Day Checklist**

### **Day Before (Feb 16)**
- [ ] Start local server and verify all features work
- [ ] Test landing page → dashboard flow
- [ ] Verify year toggle functionality
- [ ] Check all 131 accounts display properly
- [ ] Test historical dashboard performance metrics

### **Demo Day (Feb 17)**
- [ ] Start server 30 minutes before demo
- [ ] Open browser tabs ready at key URLs
- [ ] Test authentication flow once
- [ ] Have backup plan if local server fails

---

**Ready to use NOW**: The system is fully functional for both real use and demo presentation! 🎯