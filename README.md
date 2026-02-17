# 🎯 TheSalesSherpa

**"Monaco power at HubSpot pricing"**

Enterprise sales intelligence platform that transforms relationship data into revenue data.

[![Demo Ready](https://img.shields.io/badge/Demo-Feb%2017%202026-green)](https://thesalessherpa.ai)
[![Enterprise](https://img.shields.io/badge/Grade-Enterprise-blue)]()
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## 🚀 Quick Start

### Local Development (Recommended for Demo)

```bash
# Clone and enter directory
cd projects/thesalessherpa

# Make start script executable
chmod +x scripts/start-demo.sh

# Start in local mode
./scripts/start-demo.sh --local
```

This will start:
- **API Server**: http://localhost:5001
- **React Dashboard**: http://localhost:3000

### Docker Deployment

```bash
# Start with Docker Compose (includes PostgreSQL, Redis, Neo4j)
./scripts/start-demo.sh

# Or manually:
docker compose -f docker/docker-compose.yml up -d
```

---

## 📊 Demo Flow (Feb 17, 2026 @ 1:30 PM)

### Opening Hook (2 min)
> *"What if I told you there's a way to turn your 2% cold email response rate into 25%+?"*

### Demo Sequence

1. **Dashboard Overview** (3 min)
   - Show real-time urgency scores
   - Highlight WPP account (95 urgency score)
   - Point out active intelligence signals

2. **WPP Deep Dive** (5 min)
   - Click into WPP account
   - Show scoring breakdown (timing, signals, relationships)
   - Demonstrate relationship path to Marie-Claire Barker (2° separation)
   - Show AI-generated intro request message

3. **Battelle Opportunity** (3 min)
   - Highlight DOE contract renewal signal
   - Show Dr. Sarah Chen as direct connection (1°)
   - Demonstrate urgency scoring from contract alert

4. **Salesforce Export** (2 min)
   - One-click export to Salesforce
   - Show complete account package (contacts, intelligence, activities)
   - Highlight value-add to existing CRM

5. **ROI Calculator** (3 min)
   - 70 reps × 75% time savings = $8.4M annual value
   - 400% response rate improvement
   - 40% faster deal velocity

### Closing (2 min)
> *"This is what Monaco charges $50K/year for. We're building it at a fraction of the cost, starting with First Advantage."*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TheSalesSherpa Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │   Express   │  │   Services  │              │
│  │  Dashboard  │──│   API       │──│   Layer     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                 │
│  │PostgreSQL │   │  Redis    │   │  Neo4j    │                 │
│  │ (Primary) │   │ (Cache)   │   │ (Graph)   │                 │
│  └───────────┘   └───────────┘   └───────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

              External Integrations
┌─────────────────────────────────────────────────────────────────┐
│  Salesforce │ LinkedIn │ OpenAI (GPT-4) │ News APIs            │
└─────────────────────────────────────────────────────────────────┘
```

### Core Services

| Service | Purpose |
|---------|---------|
| `urgencyScoring.ts` | Multi-factor account prioritization (0-100) |
| `relationshipEngine.ts` | 7-degrees of separation pathfinding |
| `intelligenceService.ts` | AI-powered recommendations & outreach |
| `salesforceService.ts` | Full CRM integration (OAuth + sync) |

---

## 📁 Project Structure

```
thesalessherpa/
├── src/
│   ├── server/                 # TypeScript Backend
│   │   ├── app.ts             # Express application
│   │   ├── services/          # Core business logic
│   │   │   ├── urgencyScoring.ts      # Scoring algorithms
│   │   │   ├── relationshipEngine.ts  # Graph pathfinding
│   │   │   ├── intelligenceService.ts # AI recommendations
│   │   │   └── salesforceService.ts   # SF integration
│   │   └── routes/            # API endpoints
│   │
│   └── client/                 # React Frontend
│       └── src/
│           ├── pages/
│           │   ├── Dashboard.tsx      # Main dashboard
│           │   ├── AccountDetail.tsx  # Account view
│           │   └── Relationships.tsx  # Network viz
│           └── components/
│
├── database/
│   └── schema.sql             # PostgreSQL schema
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   └── Dockerfile.client
│
└── scripts/
    └── start-demo.sh          # Demo startup script
```

---

## 🎯 Urgency Scoring Algorithm

Accounts are scored 0-100 based on weighted factors:

| Factor | Weight | Components |
|--------|--------|------------|
| **Timing Signals** | 25% | Quarter-end, fiscal year, contract renewals |
| **Company Signals** | 20% | Funding, hiring, expansion, exec changes |
| **Relationship Score** | 20% | Connection degree, strength, decision makers |
| **Engagement** | 15% | Recent activity, responses, meetings |
| **Fit Score** | 10% | ICP alignment, industry, company size |
| **Competitive Intel** | 10% | Competitor usage, RFP activity |

### Score Interpretation

| Score | Priority | Label | Color |
|-------|----------|-------|-------|
| 90-100 | Critical | HOT 🔴 | Red |
| 75-89 | High | WARM 🟠 | Orange |
| 60-74 | Medium | DEVELOPING 🟡 | Yellow |
| 40-59 | Low | NURTURE 🟢 | Green |
| 0-39 | None | COLD ⚫ | Gray |

---

## 🔗 7-Degrees Relationship Mapping

### How It Works

1. **Graph Construction**: Build network from LinkedIn connections
2. **BFS Pathfinding**: Find shortest paths to target contacts
3. **Strength Scoring**: Weight edges by relationship quality
4. **Intro Success Rate**: Calculate probability based on path

### Connection Strength Factors

- Interaction frequency
- Recency of contact
- Mutual connections
- Relationship type (colleague > acquaintance)
- Public endorsements

---

## 🔌 API Endpoints

### Accounts
```
GET  /api/accounts           # List all accounts with scoring
GET  /api/accounts/:id       # Get account details
GET  /api/accounts/:id/relationships  # Get relationship paths
POST /api/accounts/:id/actions        # Record activity
```

### Intelligence
```
GET  /api/intelligence/dashboard      # Dashboard metrics
GET  /api/intelligence/alerts         # Active signals
POST /api/intelligence/outreach       # Generate outreach message
```

### Relationships
```
GET  /api/relationships/network       # Network overview
GET  /api/relationships/paths/:id     # Find path to contact
POST /api/relationships/intro-request # Request introduction
```

### Salesforce
```
GET  /api/salesforce/status           # Connection status
GET  /api/salesforce/callback         # OAuth callback
POST /api/salesforce/export/:id       # Export account package
```

---

## 📈 Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Response Rate | 2% | 10%+ | **400%** |
| Research Time/Week | 24 hrs | 6 hrs | **75% saved** |
| Connection Discovery | Manual | Automated | **300%** more |
| Deal Velocity | Baseline | +40% faster | **40%** |
| CRM Data Quality | ~60% | 95%+ | **58%** |

---

## 🛡️ Security

- **Multi-tenant isolation** with PostgreSQL RLS
- **JWT authentication** with refresh tokens
- **SAML 2.0 / OIDC** for enterprise SSO
- **Encryption** at rest (AES-256) and in transit (TLS 1.3)
- **Rate limiting** and request validation
- **Audit logging** for compliance

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Docker (optional)
- PostgreSQL 15+
- Redis 7+

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required for AI features
OPENAI_API_KEY=sk-xxx

# Required for Salesforce integration
SALESFORCE_CLIENT_ID=xxx
SALESFORCE_CLIENT_SECRET=xxx

# Database (auto-configured in Docker)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### Production Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

---

## 📊 Demo Accounts

Pre-configured for Feb 17 demo:

| Account | Urgency | Best Path | Key Signal |
|---------|---------|-----------|------------|
| **WPP** | 95 | 2° via Sarah Johnson | Q1 budget + AI initiative |
| **Battelle** | 92 | 1° (direct) | DOE contract renewal |
| **Salesforce** | 78 | 2° via Mark Thompson | Partnership opportunity |

---

## 🎤 Talk Track

### Opening
*"Every day, enterprise sales reps waste 6 hours researching accounts and sending cold emails with 2% response rates. What if AI could do that research instantly and find warm connections that get 25%+ responses?"*

### Value Proposition
*"TheSalesSherpa is relationship intelligence for enterprise sales. We map your network to find warm paths, monitor buying signals, and prioritize accounts by urgency. It's Monaco power at HubSpot pricing."*

### The Ask
*"We're starting with First Advantage. 70 reps × $120K/rep in time savings = $8.4M in annual value. I need 4-5 reps for a 30-day pilot to prove the ROI."*

---

## 📞 Contact

**Ferncliff Partners**
- Matt Edwards: matt.edwards@fadv.com
- Project Lead: hello@ferncliffpartners.com

---

## 📜 License

**PROPRIETARY** — Ferncliff Partners, LLC

All rights reserved. This software is confidential and proprietary.

---

*Built with ❤️ by Ferncliff Partners*
*TheSalesSherpa: Your AI Guide Through the Sales Wilderness* 🎯
