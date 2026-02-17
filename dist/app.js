"use strict";
/**
 * TheSalesSherpa Enterprise API Server
 *
 * Production-ready Express application with:
 * - Multi-tenant middleware
 * - JWT authentication
 * - Rate limiting
 * - Request validation
 * - Error handling
 * - API documentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
const urgencyScoring_1 = require("./services/urgencyScoring");
const relationshipEngine_1 = require("./services/relationshipEngine");
const fs_1 = require("fs");
const path_2 = require("path");
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
// ============================================================================
// MIDDLEWARE
// ============================================================================
// Security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    crossOriginEmbedderPolicy: false
}));
// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID']
};
app.use((0, cors_1.default)(corsOptions));
// Compression
app.use((0, compression_1.default)());
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request ID injection
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    res.setHeader('X-Request-ID', requestId);
    req.requestId = requestId;
    next();
});
// Request logging
app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms'));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Stricter rate limit for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: { error: 'Too many authentication attempts.' }
});
// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // For demo mode, allow unauthenticated access
    if (process.env.DEMO_MODE === 'true') {
        req.userId = 'demo-user';
        req.tenantId = 'demo-tenant';
        req.user = {
            id: 'demo-user',
            email: 'demo@thesalessherpa.ai',
            role: 'admin',
            tenantId: 'demo-tenant'
        };
        return next();
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.tenantId = decoded.tenantId;
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
// Optional authentication (for public + authenticated routes)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        authenticate(req, res, next);
    }
    else if (process.env.DEMO_MODE === 'true') {
        req.userId = 'demo-user';
        req.tenantId = 'demo-tenant';
        next();
    }
    else {
        next();
    }
};
// ============================================================================
// REAL ACCOUNT DATA - Matt's FA Territory
// ============================================================================
// Load Matt's real FA territory accounts with ATS intelligence
function loadMattAccounts() {
    try {
        const filePath = (0, path_2.join)(process.cwd(), 'data/accounts/matt_fa_accounts_with_ats.json');
        const data = JSON.parse((0, fs_1.readFileSync)(filePath, 'utf8'));
        // Transform Matt's accounts to match the expected format
        return data.accounts.map((account) => ({
            id: account.id,
            name: account.name,
            industry: account.industry || 'Unknown',
            companySize: '1000+', // Default for enterprise accounts
            employeeCount: account.employees || 5000,
            annualRevenue: 100000000, // Default $100M for enterprise
            website: account.website,
            description: `Enterprise account from Matt's FA territory`,
            headquarters: { city: 'Unknown', state: '', country: 'USA' },
            urgencyScore: account.urgencyScore || Math.floor(Math.random() * 30) + 50,
            fitScore: 75,
            engagementScore: 60,
            status: account.status,
            priority: account.priority,
            lastActivityAt: account.lastActivity || new Date('2026-01-15'),
            // ATS Intelligence
            ats: account.ats || null,
            // Add sample contacts for enhanced accounts
            contacts: account.relationships?.map((rel, index) => ({
                id: `contact-${account.id}-${index}`,
                name: rel.contact,
                title: rel.title || 'Decision Maker',
                email: `contact@${account.domain}`,
                separationDegree: Math.floor(Math.random() * 3) + 1,
                influence: {
                    budget: 80,
                    technical: 70,
                    relationship: 85,
                    urgency: 75
                },
                lastContacted: new Date('2026-01-15')
            })) || [
                {
                    id: `contact-${account.id}-1`,
                    name: 'Decision Maker',
                    title: 'VP/Director',
                    email: `contact@${account.domain}`,
                    separationDegree: 2,
                    influence: {
                        budget: 80,
                        technical: 70,
                        relationship: 85,
                        urgency: 75
                    },
                    lastContacted: new Date('2026-01-15')
                }
            ],
            // Add sample alerts for enhanced accounts  
            alerts: account.insights?.map((insight, index) => ({
                id: `alert-${account.id}-${index}`,
                type: insight.type,
                message: insight.message,
                urgency: insight.urgency,
                createdAt: new Date('2026-02-10'),
                sourceUrl: insight.source
            })) || [],
            // Add sample activities
            activities: [
                {
                    type: 'research',
                    subject: `Territory analysis for ${account.name}`,
                    date: new Date('2026-01-15'),
                    outcome: 'completed'
                }
            ]
        }));
    }
    catch (error) {
        console.error('Error loading Matt accounts:', error);
        return [];
    }
}
// Demo accounts for fallback - keeping top 5 enhanced accounts
const demoAccounts = [
    {
        id: 'wpp-001',
        name: 'WPP',
        industry: 'Advertising & Marketing',
        companySize: '10000+',
        employeeCount: 109000,
        annualRevenue: 15400000000,
        website: 'https://www.wpp.com',
        description: 'Global advertising and marketing services company',
        headquarters: { city: 'London', state: '', country: 'UK' },
        urgencyScore: 95,
        fitScore: 88,
        engagementScore: 72,
        status: 'engaged',
        priority: 'critical',
        lastActivityAt: new Date('2026-01-15'),
        contacts: [
            {
                id: 'mc-barker',
                name: 'Marie-Claire Barker',
                title: 'Chief Marketing Officer',
                email: 'mc.barker@wpp.com',
                separationDegree: 2,
                influence: { budget: 90, technical: 65, relationship: 85, urgency: 75 },
                lastContacted: new Date('2026-01-15')
            },
            {
                id: 'david-rodriguez',
                name: 'David Rodriguez',
                title: 'VP Marketing Technology',
                email: 'd.rodriguez@wpp.com',
                separationDegree: 3,
                influence: { budget: 70, technical: 95, relationship: 60, urgency: 80 },
                lastContacted: new Date('2026-01-08')
            }
        ],
        alerts: [
            {
                id: 'alert-1',
                type: 'budget',
                message: 'Q1 budget cycle + hiring spree detected',
                urgency: 'critical',
                createdAt: new Date('2026-02-10')
            },
            {
                id: 'alert-2',
                type: 'news',
                message: 'WPP announces AI initiative expansion',
                urgency: 'medium',
                createdAt: new Date('2026-02-08'),
                sourceUrl: 'https://example.com/wpp-news'
            }
        ],
        activities: [
            { type: 'email_sent', subject: 'AI transformation discussion', date: new Date('2026-01-15'), outcome: 'opened' },
            { type: 'linkedin_viewed', subject: 'Profile view', date: new Date('2026-01-08') }
        ]
    },
    {
        id: 'battelle-001',
        name: 'Battelle',
        industry: 'Research & Development',
        companySize: '10000+',
        employeeCount: 25000,
        annualRevenue: 6800000000,
        website: 'https://www.battelle.org',
        description: 'Science and technology development company',
        headquarters: { city: 'Columbus', state: 'OH', country: 'USA' },
        urgencyScore: 92,
        fitScore: 82,
        engagementScore: 45,
        status: 'target',
        priority: 'critical',
        lastActivityAt: new Date('2025-12-03'),
        contacts: [
            {
                id: 'sarah-chen',
                name: 'Dr. Sarah Chen',
                title: 'Chief Technology Officer',
                email: 's.chen@battelle.org',
                separationDegree: 1,
                influence: { budget: 85, technical: 98, relationship: 92, urgency: 88 },
                lastContacted: new Date('2025-12-03')
            },
            {
                id: 'michael-torres',
                name: 'Michael Torres',
                title: 'Chief Information Security Officer',
                email: 'm.torres@battelle.org',
                separationDegree: 4,
                influence: { budget: 75, technical: 88, relationship: 65, urgency: 95 },
                lastContacted: null
            }
        ],
        alerts: [
            {
                id: 'alert-3',
                type: 'contract',
                message: 'DOE contract renewal + security focus',
                urgency: 'critical',
                createdAt: new Date('2026-02-12')
            },
            {
                id: 'alert-4',
                type: 'hiring',
                message: 'Posted 5 new cybersecurity positions',
                urgency: 'medium',
                createdAt: new Date('2026-02-09')
            }
        ],
        activities: [
            { type: 'call', subject: 'Quarterly technology review', date: new Date('2025-12-03'), outcome: 'completed' }
        ]
    },
    {
        id: 'salesforce-001',
        name: 'Salesforce',
        industry: 'Software & Technology',
        companySize: '10000+',
        employeeCount: 79000,
        annualRevenue: 31300000000,
        website: 'https://www.salesforce.com',
        description: 'Leading CRM and cloud computing company',
        headquarters: { city: 'San Francisco', state: 'CA', country: 'USA' },
        urgencyScore: 78,
        fitScore: 95,
        engagementScore: 68,
        status: 'researching',
        priority: 'high',
        lastActivityAt: new Date('2026-01-22'),
        contacts: [
            {
                id: 'jennifer-walsh',
                name: 'Jennifer Walsh',
                title: 'VP Strategic Partnerships',
                email: 'j.walsh@salesforce.com',
                separationDegree: 2,
                influence: { budget: 88, technical: 70, relationship: 90, urgency: 65 },
                lastContacted: new Date('2026-01-22')
            }
        ],
        alerts: [
            {
                id: 'alert-5',
                type: 'product_launch',
                message: 'Einstein AI platform expansion announcement',
                urgency: 'medium',
                createdAt: new Date('2026-02-11')
            }
        ],
        activities: [
            { type: 'demo', subject: 'Partnership opportunity presentation', date: new Date('2026-01-22'), outcome: 'scheduled' }
        ]
    }
];
// ============================================================================
// API ROUTES
// ============================================================================
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});
// API documentation
app.get('/api', (req, res) => {
    res.json({
        name: 'TheSalesSherpa API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            accounts: '/api/accounts',
            relationships: '/api/relationships',
            intelligence: '/api/intelligence',
            salesforce: '/api/salesforce',
            auth: '/api/auth'
        }
    });
});
// ============================================================================
// ACCOUNTS API
// ============================================================================
// Get all accounts
app.get('/api/accounts', optionalAuth, (req, res) => {
    // Load Matt's real FA territory accounts
    const mattAccounts = loadMattAccounts();
    const allAccounts = mattAccounts.length > 0 ? mattAccounts : demoAccounts;
    const sortedAccounts = [...allAccounts].sort((a, b) => b.urgencyScore - a.urgencyScore);
    // Calculate scoring breakdown for each account
    const accountsWithScoring = sortedAccounts.map(account => {
        const breakdown = (0, urgencyScoring_1.calculateUrgencyScore)({
            id: account.id,
            name: account.name,
            industry: account.industry,
            companySize: account.companySize,
            employeeCount: account.employeeCount,
            annualRevenue: account.annualRevenue,
            contacts: account.contacts,
            alerts: account.alerts.map(a => ({ ...a, type: a.type, urgency: a.urgency })),
            activities: account.activities.map(a => ({ ...a, id: (0, uuid_1.v4)(), createdAt: a.date })),
            lastActivityAt: account.lastActivityAt
        });
        const priority = (0, urgencyScoring_1.getPriorityLevel)(breakdown.overall);
        return {
            ...account,
            scoringBreakdown: breakdown,
            priority: priority.level,
            priorityColor: priority.color,
            priorityLabel: priority.label
        };
    });
    res.json({
        success: true,
        data: accountsWithScoring,
        meta: {
            total: accountsWithScoring.length,
            avgUrgencyScore: Math.round(accountsWithScoring.reduce((sum, acc) => sum + acc.urgencyScore, 0) / accountsWithScoring.length)
        }
    });
});
// Get single account
app.get('/api/accounts/:id', optionalAuth, (req, res) => {
    const mattAccounts = loadMattAccounts();
    const allAccounts = mattAccounts.length > 0 ? mattAccounts : demoAccounts;
    const account = allAccounts.find((a) => a.id === req.params.id);
    if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }
    const breakdown = (0, urgencyScoring_1.calculateUrgencyScore)({
        id: account.id,
        name: account.name,
        industry: account.industry,
        companySize: account.companySize,
        employeeCount: account.employeeCount,
        annualRevenue: account.annualRevenue,
        contacts: account.contacts,
        alerts: account.alerts.map(a => ({ ...a, type: a.type, urgency: a.urgency })),
        activities: account.activities.map(a => ({ ...a, id: (0, uuid_1.v4)(), createdAt: a.date })),
        lastActivityAt: account.lastActivityAt
    });
    const priority = (0, urgencyScoring_1.getPriorityLevel)(breakdown.overall);
    res.json({
        success: true,
        data: {
            ...account,
            scoringBreakdown: breakdown,
            priority: priority.level,
            priorityColor: priority.color,
            priorityLabel: priority.label
        }
    });
});
// Get account relationships
app.get('/api/accounts/:id/relationships', optionalAuth, async (req, res) => {
    const account = demoAccounts.find(a => a.id === req.params.id);
    if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }
    // Create relationship engine for demo
    const engine = await (0, relationshipEngine_1.createRelationshipEngine)('demo-user', [
        { id: 'sarah-johnson', name: 'Sarah Johnson', title: 'Director of Marketing', company: 'Adobe', relationshipType: 'former_colleague', strength: 0.95, context: 'Worked together at TechCorp 2019-2021' },
        { id: 'john-smith', name: 'John Smith', title: 'VP Engineering', company: 'Microsoft', relationshipType: 'former_colleague', strength: 0.88, context: 'Former colleagues at StartupCo' },
        { id: 'sarah-chen-direct', name: 'Dr. Sarah Chen', title: 'CTO', company: 'Battelle', relationshipType: 'former_colleague', strength: 0.92, context: 'Worked together at DOE Lab' },
        { id: 'mark-thompson', name: 'Mark Thompson', title: 'Former Manager', company: 'Oracle', relationshipType: 'manager', strength: 0.91, context: 'Direct manager 2020-2022' }
    ], [
        { sourceId: 'sarah-johnson', target: { id: 'mc-barker', name: 'Marie-Claire Barker', title: 'CMO', company: 'WPP' }, relationshipType: 'acquaintance', strength: 0.78, context: 'Industry connections through MarTech Alliance' },
        { sourceId: 'john-smith', target: { id: 'lisa-chen', name: 'Lisa Chen', title: 'Solutions Architect', company: 'Microsoft' }, relationshipType: 'colleague', strength: 0.82 },
        { sourceId: 'lisa-chen', target: { id: 'david-rodriguez', name: 'David Rodriguez', title: 'VP Marketing Technology', company: 'WPP' }, relationshipType: 'vendor', strength: 0.71, context: 'Previous vendor relationship - Microsoft Azure' },
        { sourceId: 'mark-thompson', target: { id: 'jennifer-walsh', name: 'Jennifer Walsh', title: 'VP Strategic Partnerships', company: 'Salesforce' }, relationshipType: 'colleague', strength: 0.84, context: 'Worked together on Oracle-Salesforce partnership' }
    ]);
    // Find paths to all contacts
    const relationshipPaths = account.contacts.map(contact => {
        const path = engine.findPaths(contact.id);
        return {
            contactId: contact.id,
            contactName: contact.name,
            contactTitle: contact.title,
            ...path
        };
    }).filter(r => r.path);
    res.json({
        success: true,
        data: {
            accountId: account.id,
            accountName: account.name,
            relationships: relationshipPaths,
            networkStats: engine.getNetworkStats()
        }
    });
});
// ============================================================================
// INTELLIGENCE API
// ============================================================================
// Get dashboard intelligence
app.get('/api/intelligence/dashboard', optionalAuth, async (req, res) => {
    try {
        // Load Matt's real accounts and convert to intelligence context
        const mattAccounts = loadMattAccounts();
        const allAccounts = mattAccounts.length > 0 ? mattAccounts : demoAccounts;
        const accountContexts = allAccounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            industry: acc.industry,
            urgencyScore: acc.urgencyScore,
            contacts: acc.contacts.map(c => ({
                id: c.id,
                name: c.name,
                title: c.title,
                email: c.email,
                separationDegree: c.separationDegree,
                influence: c.influence,
                lastContacted: c.lastContacted
            })),
            recentAlerts: acc.alerts.map(a => ({
                type: a.type,
                message: a.message,
                urgency: a.urgency,
                createdAt: a.createdAt,
                sourceUrl: a.sourceUrl
            })),
            recentActivities: acc.activities.map(a => ({
                type: a.type,
                subject: a.subject,
                date: a.date,
                outcome: a.outcome
            })),
            relationships: acc.contacts.map(c => ({
                targetName: c.name,
                targetTitle: c.title,
                degrees: c.separationDegree,
                confidence: 0.8
            }))
        }));
        // Calculate stats
        const highPriority = accountContexts.filter(a => a.urgencyScore >= 80);
        const avgScore = Math.round(accountContexts.reduce((sum, a) => sum + a.urgencyScore, 0) / accountContexts.length);
        const totalAlerts = accountContexts.reduce((sum, a) => sum + a.recentAlerts.length, 0);
        // Generate top actions
        const topActions = [
            {
                priority: 'urgent',
                action: 'Request intro to Marie-Claire Barker via Sarah Johnson',
                account: 'WPP',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                priority: 'urgent',
                action: 'Re-engage Dr. Sarah Chen - no contact in 71 days',
                account: 'Battelle',
                deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                priority: 'high',
                action: 'Leverage DOE contract renewal signal',
                account: 'Battelle',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                priority: 'high',
                action: 'Follow up on AI initiative expansion news',
                account: 'WPP',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                priority: 'medium',
                action: 'Connect with Jennifer Walsh for partnership discussion',
                account: 'Salesforce',
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        // Recent activities
        const recentActivities = [
            { type: 'alert', message: 'DOE contract renewal detected - Battelle', timestamp: new Date('2026-02-12T10:00:00Z') },
            { type: 'alert', message: 'Q1 budget cycle signal - WPP', timestamp: new Date('2026-02-10T14:30:00Z') },
            { type: 'news', message: 'WPP AI initiative expansion', timestamp: new Date('2026-02-08T09:15:00Z') },
            { type: 'activity', message: 'Email sent to Marie-Claire Barker', timestamp: new Date('2026-01-15T11:00:00Z') }
        ];
        res.json({
            success: true,
            data: {
                totalAccounts: accountContexts.length,
                highPriorityAccounts: highPriority.length,
                totalAlerts,
                averageUrgencyScore: avgScore,
                topActions,
                recentActivities,
                weeklyStats: {
                    newOpportunities: 3,
                    completedActivities: 12,
                    introductionsRequested: 2,
                    responseRate: 0.73
                }
            }
        });
    }
    catch (error) {
        console.error('Dashboard intelligence error:', error);
        res.status(500).json({ error: 'Failed to generate dashboard intelligence' });
    }
});
// Get alerts
app.get('/api/intelligence/alerts', optionalAuth, (req, res) => {
    const mattAccounts = loadMattAccounts();
    const allAccounts = mattAccounts.length > 0 ? mattAccounts : demoAccounts;
    const allAlerts = allAccounts.flatMap((account) => account.alerts.map(alert => ({
        ...alert,
        accountId: account.id,
        accountName: account.name,
        timestamp: alert.createdAt
    }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({
        success: true,
        data: allAlerts
    });
});
// Get cadence matrix data
app.get('/api/cadence/matrix', optionalAuth, (req, res) => {
    try {
        // Load Matt's accounts for cadence view - fall back to demo accounts if no contacts
        const mattAccounts = loadMattAccounts();
        let allAccounts = mattAccounts.length > 0 ? mattAccounts : demoAccounts;
        // Ensure we have accounts with contacts for the demo
        if (allAccounts.every(acc => !acc.contacts || acc.contacts.length === 0)) {
            allAccounts = demoAccounts; // Use demo accounts which have populated contacts
        }
        // Structure data for cadence matrix (account -> contacts -> outreach history)
        const cadenceData = allAccounts.slice(0, 8).map((account) => ({
            ...account,
            contacts: (account.contacts || []).map((contact) => ({
                ...contact,
                cadenceStage: Math.floor(Math.random() * 7) + 1,
                responseRate: 0.15 + Math.random() * 0.6,
                outreachHistory: [
                    {
                        id: `touch-${account.id}-${contact.id}-1`,
                        type: 'email',
                        subject: 'Initial intro - FA capabilities',
                        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        outcome: 'opened',
                        responseReceived: false
                    },
                    {
                        id: `touch-${account.id}-${contact.id}-2`,
                        type: 'linkedin',
                        subject: 'LinkedIn connection request',
                        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                        outcome: 'no_response',
                        responseReceived: false
                    }
                ],
                nextAction: {
                    type: Math.random() > 0.5 ? 'email' : 'call',
                    message: Math.random() > 0.5 ? 'Case study: Similar company success story' : 'Direct call during optimal window (Tue-Thu 10-11am)',
                    priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                    daysWait: Math.floor(Math.random() * 7) + 1
                }
            }))
        }));
        // Filter out accounts with no contacts for the cadence view
        const accountsWithContacts = cadenceData.filter(acc => acc.contacts.length > 0);
        res.json({
            success: true,
            data: accountsWithContacts,
            meta: {
                totalAccounts: accountsWithContacts.length,
                totalContacts: accountsWithContacts.reduce((sum, acc) => sum + acc.contacts.length, 0),
                activeSequences: accountsWithContacts.reduce((sum, acc) => sum + acc.contacts.length, 0)
            }
        });
    }
    catch (error) {
        console.error('Cadence matrix error:', error);
        res.status(500).json({ error: 'Failed to load cadence matrix data' });
    }
});
// Generate outreach message
app.post('/api/intelligence/outreach', authenticate, async (req, res) => {
    try {
        const { recipientName, recipientTitle, recipientCompany, relationshipPath, purpose, channel } = req.body;
        // In production, use actual IntelligenceService
        const template = {
            id: `template-${Date.now()}`,
            type: channel || 'email',
            subject: `Quick question for ${recipientCompany}`,
            body: `Hi ${recipientName},

I hope this message finds you well. ${relationshipPath ? `I understand we're connected through ${relationshipPath}. ` : ''}

I've been following ${recipientCompany}'s recent initiatives and believe there could be some interesting synergies to explore around ${purpose || 'digital transformation'}.

Would you be open to a brief conversation this week?

Best regards`,
            personalization: ['company research', 'industry context', 'mutual connection'],
            expectedResponseRate: relationshipPath ? 0.25 : 0.05
        };
        res.json({
            success: true,
            data: template
        });
    }
    catch (error) {
        console.error('Outreach generation error:', error);
        res.status(500).json({ error: 'Failed to generate outreach message' });
    }
});
// ============================================================================
// RELATIONSHIPS API
// ============================================================================
// Get Matt's LinkedIn Intelligence
app.get('/api/relationships/linkedin', optionalAuth, (req, res) => {
    try {
        const intelligencePath = (0, path_2.join)(process.cwd(), 'data/processed/matt_linkedin_intelligence.json');
        const connectionsPath = (0, path_2.join)(process.cwd(), 'data/processed/matt_linkedin_connections.json');
        let intelligence = {};
        let connections = [];
        try {
            intelligence = JSON.parse((0, fs_1.readFileSync)(intelligencePath, 'utf8'));
            connections = JSON.parse((0, fs_1.readFileSync)(connectionsPath, 'utf8'));
        }
        catch (error) {
            console.log('LinkedIn data not found, using empty data');
        }
        res.json({
            success: true,
            data: {
                intelligence,
                recentConnections: connections.slice(0, 10),
                totalProcessed: connections.length
            }
        });
    }
    catch (error) {
        console.error('LinkedIn intelligence error:', error);
        res.status(500).json({ error: 'Failed to load LinkedIn intelligence' });
    }
});
// Get network overview
app.get('/api/relationships/network', optionalAuth, async (req, res) => {
    const engine = await (0, relationshipEngine_1.createRelationshipEngine)('demo-user', [
        { id: 'sarah-johnson', name: 'Sarah Johnson', title: 'Director of Marketing', company: 'Adobe', relationshipType: 'former_colleague', strength: 0.95, context: 'Worked together at TechCorp 2019-2021' },
        { id: 'john-smith', name: 'John Smith', title: 'VP Engineering', company: 'Microsoft', relationshipType: 'former_colleague', strength: 0.88, context: 'Former colleagues at StartupCo' },
        { id: 'sarah-chen-direct', name: 'Dr. Sarah Chen', title: 'CTO', company: 'Battelle', relationshipType: 'former_colleague', strength: 0.92, context: 'Worked together at DOE Lab' },
        { id: 'mark-thompson', name: 'Mark Thompson', title: 'Former Manager', company: 'Oracle', relationshipType: 'manager', strength: 0.91, context: 'Direct manager 2020-2022' }
    ]);
    const stats = engine.getNetworkStats();
    res.json({
        success: true,
        data: {
            stats: {
                totalConnections: 247,
                firstDegree: stats.directConnections,
                secondDegree: 3891,
                thirdDegree: 18750,
                companiesReachable: 1250,
                decisionMakersReachable: 892,
                averageConnectionStrength: stats.averageStrength
            },
            directConnections: [
                { id: 'sarah-johnson', name: 'Sarah Johnson', title: 'Director of Marketing', company: 'Adobe', connectionStrength: 0.95, lastInteraction: '2026-02-10', relationshipType: 'former-colleague', mutualConnections: 23 },
                { id: 'john-smith', name: 'John Smith', title: 'VP Engineering', company: 'Microsoft', connectionStrength: 0.88, lastInteraction: '2026-01-28', relationshipType: 'former-colleague', mutualConnections: 15 },
                { id: 'sarah-chen-direct', name: 'Dr. Sarah Chen', title: 'Chief Technology Officer', company: 'Battelle', connectionStrength: 0.92, lastInteraction: '2025-12-03', relationshipType: 'former-colleague', mutualConnections: 8 },
                { id: 'mark-thompson', name: 'Mark Thompson', title: 'Former Manager', company: 'Oracle', connectionStrength: 0.91, lastInteraction: '2026-02-05', relationshipType: 'manager', mutualConnections: 12 }
            ]
        }
    });
});
// Get path to specific contact
app.get('/api/relationships/paths/:targetId', optionalAuth, async (req, res) => {
    const { targetId } = req.params;
    // Demo path data
    const demoPathsMap = {
        'mc-barker': {
            targetId: 'mc-barker',
            targetName: 'Marie-Claire Barker',
            targetTitle: 'CMO at WPP',
            degrees: 2,
            path: [
                { nodeId: 'user', name: 'You', title: 'Sales Executive', company: 'First Advantage' },
                { nodeId: 'sarah-johnson', name: 'Sarah Johnson', title: 'Director of Marketing', company: 'Adobe', connectionStrength: 0.95, relationshipContext: 'Worked together at TechCorp 2019-2021' },
                { nodeId: 'mc-barker', name: 'Marie-Claire Barker', title: 'Chief Marketing Officer', company: 'WPP', connectionStrength: 0.78, relationshipContext: 'Industry connections through MarTech Alliance' }
            ],
            confidence: 0.85,
            introSuccessRate: 0.73,
            suggestedMessage: "Hi Sarah! Hope you're doing well at Adobe. I'm working with enterprise companies on digital transformation initiatives and remember you mentioning your connection with Marie-Claire at WPP. Would you be comfortable making a brief introduction? I think there could be some interesting synergies to explore."
        },
        'david-rodriguez': {
            targetId: 'david-rodriguez',
            targetName: 'David Rodriguez',
            targetTitle: 'VP Marketing Technology at WPP',
            degrees: 3,
            path: [
                { nodeId: 'user', name: 'You', title: 'Sales Executive', company: 'First Advantage' },
                { nodeId: 'john-smith', name: 'John Smith', title: 'VP Engineering', company: 'Microsoft', connectionStrength: 0.88 },
                { nodeId: 'lisa-chen', name: 'Lisa Chen', title: 'Solutions Architect', company: 'Microsoft', connectionStrength: 0.82 },
                { nodeId: 'david-rodriguez', name: 'David Rodriguez', title: 'VP Marketing Technology', company: 'WPP', connectionStrength: 0.71 }
            ],
            confidence: 0.76,
            introSuccessRate: 0.58,
            suggestedMessage: "Hey John! Quick favor - I'm connecting with marketing technology leaders about AI transformation initiatives. I see you know Lisa Chen who has worked with David Rodriguez at WPP. Would it make sense to get a brief intro? Happy to keep it high-level initially."
        },
        'sarah-chen': {
            targetId: 'sarah-chen',
            targetName: 'Dr. Sarah Chen',
            targetTitle: 'CTO at Battelle',
            degrees: 1,
            path: [
                { nodeId: 'user', name: 'You', title: 'Sales Executive', company: 'First Advantage' },
                { nodeId: 'sarah-chen', name: 'Dr. Sarah Chen', title: 'Chief Technology Officer', company: 'Battelle', connectionStrength: 0.92, relationshipContext: 'Direct connection - worked together at DOE Lab' }
            ],
            confidence: 0.92,
            introSuccessRate: 0.85,
            suggestedMessage: "Direct connection - reach out directly!"
        }
    };
    const pathData = demoPathsMap[targetId];
    if (!pathData) {
        res.status(404).json({
            error: 'No relationship path found',
            suggestion: 'Consider cold outreach or LinkedIn connection request'
        });
        return;
    }
    res.json({
        success: true,
        data: pathData
    });
});
// ============================================================================  
// WARM INTRO RELATIONSHIP INTELLIGENCE API
// ============================================================================
// Import relationships route handler
const relationshipsRouter = require('./routes/relationships');
app.use('/api/relationships', relationshipsRouter);
// ============================================================================
// SALESFORCE INTEGRATION API
// ============================================================================
// Salesforce OAuth callback
app.get('/api/salesforce/callback', async (req, res) => {
    const { code, state } = req.query;
    if (!code) {
        res.status(400).json({ error: 'Missing authorization code' });
        return;
    }
    // In production, exchange code for tokens using SalesforceService
    res.json({
        success: true,
        message: 'Salesforce connected successfully',
        note: 'In production, tokens would be stored and user redirected'
    });
});
// Export account to Salesforce
app.post('/api/salesforce/export/:accountId', authenticate, async (req, res) => {
    const { accountId } = req.params;
    const account = demoAccounts.find(a => a.id === accountId);
    if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }
    // Demo response - in production, use SalesforceService.exportAccountPackage
    res.json({
        success: true,
        message: 'Account exported to Salesforce',
        results: {
            account: { success: true, salesforceId: '001XXXXXXXXXXXX', action: 'created' },
            contacts: account.contacts.map(c => ({
                name: c.name,
                success: true,
                salesforceId: '003XXXXXXXXXXXX',
                action: 'created'
            })),
            opportunity: { success: true, salesforceId: '006XXXXXXXXXXXX', action: 'created' }
        },
        salesforceUrl: 'https://yourorg.salesforce.com/001XXXXXXXXXXXX'
    });
});
// Check Salesforce connection
app.get('/api/salesforce/status', authenticate, async (req, res) => {
    // Demo response
    res.json({
        success: true,
        connected: false,
        message: 'Salesforce not connected. Click Connect to begin OAuth flow.',
        authUrl: '/api/salesforce/auth'
    });
});
// ============================================================================
// STATIC FILES AND REACT APP SERVING
// ============================================================================
// Serve static files from the React app build directory
const buildPath = path_1.default.join(__dirname, '../client/build');
app.use(express_1.default.static(buildPath));
// Also serve public files (images, etc.) during development
const publicPath = path_1.default.join(__dirname, '../../public');
app.use(express_1.default.static(publicPath));
// Handle React Router - serve React app for all non-API routes
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            error: 'API Route not found',
            path: req.originalUrl,
            method: req.method
        });
        return;
    }
    // Serve React app for all other routes (including /fa/mattedwards/*)
    res.sendFile(path_1.default.join(buildPath, 'index.html'));
});
// ============================================================================
// ERROR HANDLING
// ============================================================================
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        requestId: req.requestId
    });
});
// ============================================================================
// START SERVER
// ============================================================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
🎯 ═══════════════════════════════════════════════════════════
   TheSalesSherpa API Server
   ═══════════════════════════════════════════════════════════
   
   🚀 Running on port ${PORT}
   📍 Environment: ${process.env.NODE_ENV || 'development'}
   🔐 Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'}
   
   API Endpoints:
   • GET  /api/accounts           - List all accounts
   • GET  /api/accounts/:id       - Get account details
   • GET  /api/intelligence/dashboard - Dashboard data
   • GET  /api/relationships/network  - Network overview
   • GET  /api/relationships/paths/:id - Find connection path
   
   Ready for Feb 17 Demo! 🎯
═══════════════════════════════════════════════════════════
    `);
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map