# TheSalesSherpa Enterprise Architecture

**Target: $100M+ Acquisition Quality Codebase**
**Demo: February 17, 2026 @ 1:30 PM**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TheSalesSherpa Platform                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Web App    │  │  Mobile PWA  │  │ Chrome Ext   │  │  Slack Bot  │ │
│  │   (React)    │  │   (React)    │  │ (LinkedIn)   │  │ (Webhooks)  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │        │
│         └─────────────────┼─────────────────┼─────────────────┘        │
│                           │                 │                          │
│                           ▼                 ▼                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway (Express + Kong)                 │   │
│  │         Rate Limiting • Auth • Logging • Multi-tenant           │   │
│  └───────────────────────────┬─────────────────────────────────────┘   │
│                              │                                         │
│    ┌─────────────────────────┼─────────────────────────────┐          │
│    │                         │                             │          │
│    ▼                         ▼                             ▼          │
│ ┌──────────────┐   ┌──────────────────┐   ┌──────────────────────┐   │
│ │  Account     │   │   Relationship   │   │    Intelligence      │   │
│ │  Service     │   │   Mapping Engine │   │    Engine            │   │
│ │              │   │                  │   │                      │   │
│ │  • CRUD      │   │  • 7° Separation │   │  • News Monitoring   │   │
│ │  • Scoring   │   │  • Path Finding  │   │  • Urgency Scoring   │   │
│ │  • Activity  │   │  • Graph Algos   │   │  • AI Suggestions    │   │
│ └──────┬───────┘   └────────┬─────────┘   └──────────┬───────────┘   │
│        │                    │                        │               │
│        └────────────────────┼────────────────────────┘               │
│                             │                                        │
│    ┌────────────────────────┼────────────────────────────────┐      │
│    │                        ▼                                │      │
│    │  ┌─────────────────────────────────────────────────┐    │      │
│    │  │                 Data Layer                       │    │      │
│    │  ├─────────────────────────────────────────────────┤    │      │
│    │  │                                                 │    │      │
│    │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐    │    │      │
│    │  │  │PostgreSQL │  │  Redis    │  │   Neo4j   │    │    │      │
│    │  │  │(Primary)  │  │ (Cache)   │  │ (Graph)   │    │    │      │
│    │  │  │           │  │           │  │           │    │    │      │
│    │  │  │Multi-     │  │Sessions   │  │Relation-  │    │    │      │
│    │  │  │tenant     │  │Rate Limit │  │ship Maps  │    │    │      │
│    │  │  └───────────┘  └───────────┘  └───────────┘    │    │      │
│    │  │                                                 │    │      │
│    │  └─────────────────────────────────────────────────┘    │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

                    External Integrations
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │
│  │Salesforce │  │ LinkedIn  │  │  OpenAI   │  │  News APIs        │ │
│  │   API     │  │   API     │  │  (GPT-4)  │  │  (GNews/NewsAPI)  │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenant Architecture

### Tenant Isolation Model

```sql
-- Every table includes tenant_id for row-level security
-- PostgreSQL RLS (Row Level Security) enforces isolation

CREATE POLICY tenant_isolation ON accounts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Tenant Hierarchy

```
Organization (Tenant)
├── Teams
│   ├── Users
│   │   ├── Accounts (ownership)
│   │   ├── Contacts (access)
│   │   └── Activities (logged)
│   └── Shared Resources
├── Subscription Plan
├── API Keys
└── Integrations (Salesforce, LinkedIn)
```

---

## Database Schema (PostgreSQL)

### Core Tables

1. **tenants** - Organization/company records
2. **users** - Individual user accounts
3. **accounts** - Target companies/prospects
4. **contacts** - People at target accounts
5. **relationships** - Connection network
6. **activities** - Touchpoints and actions
7. **alerts** - Intelligence signals
8. **integrations** - External service connections

### Graph Database (Neo4j)

For 7-degrees relationship mapping:
- Nodes: Users, Contacts, Connections
- Edges: Relationship types (colleague, friend, etc.)
- Properties: Strength, recency, context

---

## Urgency Scoring Algorithm

### Components (0-100 scale)

```
URGENCY_SCORE = weighted_sum([
    (TIMING_SIGNALS,      0.25),  // Budget cycles, fiscal years
    (COMPANY_SIGNALS,     0.20),  // News, funding, hiring
    (RELATIONSHIP_SCORE,  0.20),  // Connection strength
    (ENGAGEMENT_SIGNALS,  0.15),  // Recent activity, responses
    (FIT_SCORE,          0.10),  // ICP match
    (COMPETITIVE_INTEL,  0.10),  // Competitor mentions
])
```

### Scoring Breakdown

**Timing Signals (25%)**
- End of quarter proximity: +10-20
- Budget cycle awareness: +15
- Fiscal year planning: +10
- Contract renewal dates: +20

**Company Signals (20%)**
- Recent funding: +15
- Executive hiring: +10
- Expansion news: +12
- Technology initiatives: +8

**Relationship Score (20%)**
- 1° separation: +20
- 2° separation: +15
- 3° separation: +10
- 4° separation: +5
- Strong mutual connections: +5

**Engagement Signals (15%)**
- Recent response: +15
- Website visits: +10
- Content downloads: +8
- Event attendance: +5

**Fit Score (10%)**
- ICP match: +10
- Industry alignment: +5
- Size compatibility: +5

**Competitive Intelligence (10%)**
- Using competitor: +10
- Competitive RFP: +15
- Dissatisfaction signals: +12

---

## 7-Degrees Relationship Mapping

### Graph Algorithm

```python
def find_shortest_path(source: User, target: Contact, max_depth: int = 7):
    """
    BFS-based pathfinding with relationship scoring
    Returns: List of connection hops with confidence scores
    """
    visited = set()
    queue = deque([(source, [source], 1.0)])  # (node, path, confidence)
    
    while queue:
        current, path, confidence = queue.popleft()
        
        if current == target:
            return PathResult(
                path=path,
                degrees=len(path) - 1,
                confidence=confidence,
                intro_success_rate=calculate_intro_success(path)
            )
        
        if len(path) >= max_depth:
            continue
            
        for neighbor in get_connections(current):
            if neighbor.id not in visited:
                visited.add(neighbor.id)
                edge_strength = get_relationship_strength(current, neighbor)
                new_confidence = confidence * edge_strength
                queue.append((neighbor, path + [neighbor], new_confidence))
    
    return None  # No path found within max_depth
```

### Relationship Strength Factors

- Interaction frequency
- Recency of contact
- Mutual connection count
- Professional vs personal relationship
- Public endorsements/recommendations

---

## API Integrations

### Salesforce Integration

- **OAuth 2.0** for authentication
- **REST API** for account/contact/opportunity sync
- **Streaming API** for real-time updates
- **Bulk API** for large data imports

Endpoints:
- `POST /api/salesforce/connect` - OAuth flow
- `GET /api/salesforce/accounts` - Sync accounts
- `POST /api/salesforce/export` - Push opportunities

### LinkedIn Integration

- **Sales Navigator API** (enterprise)
- **People Search** for contact enrichment
- **Company Search** for account data
- **Relationship mapping** from connections

---

## Security Model

### Authentication
- JWT tokens with refresh
- SAML 2.0 / OIDC for enterprise SSO
- API keys for programmatic access
- MFA enforcement

### Authorization
- Role-based access control (RBAC)
- Row-level security (RLS) in PostgreSQL
- Tenant isolation at all layers
- Audit logging

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII handling compliance (GDPR/CCPA)
- Data retention policies

---

## Infrastructure

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS / GCP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  CloudFront / CDN                    │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│  ┌─────────────────────────┼───────────────────────────┐   │
│  │                  Load Balancer                       │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│    ┌──────────────────┬────┴────┬──────────────────┐       │
│    │                  │         │                  │       │
│    ▼                  ▼         ▼                  ▼       │
│  ┌─────┐         ┌─────┐   ┌─────┐           ┌─────┐     │
│  │ API │         │ API │   │ API │           │ API │     │
│  │ Pod │         │ Pod │   │ Pod │           │ Pod │     │
│  └─────┘         └─────┘   └─────┘           └─────┘     │
│    │                  │         │                  │       │
│    └──────────────────┼─────────┼──────────────────┘       │
│                       │         │                          │
│  ┌────────────────────┼─────────┼────────────────────┐     │
│  │                    ▼         ▼                    │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │     │
│  │  │PostgreSQL│  │  Redis   │  │    Neo4j     │    │     │
│  │  │ Primary  │  │ Cluster  │  │   Cluster    │    │     │
│  │  │ + Replica│  │          │  │              │    │     │
│  │  └──────────┘  └──────────┘  └──────────────┘    │     │
│  │                                                   │     │
│  │                  Managed Services                 │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
thesalessherpa/
├── src/
│   ├── server/
│   │   ├── app.ts                    # Express app entry
│   │   ├── config/
│   │   │   ├── database.ts           # PostgreSQL + Redis + Neo4j
│   │   │   ├── auth.ts               # JWT + OAuth config
│   │   │   └── integrations.ts       # External API config
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT validation
│   │   │   ├── tenant.ts             # Multi-tenant isolation
│   │   │   ├── rateLimit.ts          # API rate limiting
│   │   │   └── validation.ts         # Request validation
│   │   ├── models/
│   │   │   ├── Tenant.ts
│   │   │   ├── User.ts
│   │   │   ├── Account.ts
│   │   │   ├── Contact.ts
│   │   │   ├── Activity.ts
│   │   │   └── Integration.ts
│   │   ├── services/
│   │   │   ├── relationshipEngine.ts # 7° mapping
│   │   │   ├── urgencyScoring.ts     # Scoring algorithms
│   │   │   ├── intelligenceService.ts# AI recommendations
│   │   │   ├── salesforceService.ts  # SF integration
│   │   │   ├── linkedinService.ts    # LI integration
│   │   │   └── newsService.ts        # News monitoring
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── accounts.ts
│   │   │   ├── contacts.ts
│   │   │   ├── relationships.ts
│   │   │   ├── intelligence.ts
│   │   │   └── integrations.ts
│   │   └── workers/
│   │       ├── newsMonitor.ts        # Background news scanning
│   │       ├── urgencyRecalc.ts      # Score updates
│   │       └── syncWorker.ts         # Integration sync
│   │
│   └── client/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Dashboard/
│       │   │   ├── Accounts/
│       │   │   ├── Relationships/
│       │   │   ├── Intelligence/
│       │   │   └── common/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── store/                # Redux state
│       │   └── utils/
│       └── public/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.client
│   └── docker-compose.yml
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── INTEGRATIONS.md
```

---

## Demo Ready Features (Feb 17)

### Must Have
- [x] Dashboard with urgency scoring
- [x] Account list with prioritization
- [x] 7-degrees relationship visualization
- [ ] Salesforce export demo
- [ ] AI-generated outreach suggestions
- [ ] News/signal alerts panel

### Nice to Have
- [ ] LinkedIn import
- [ ] Email integration
- [ ] Mobile responsive
- [ ] Slack notifications

---

*Architecture Version: 1.0*
*Last Updated: February 12, 2026*
