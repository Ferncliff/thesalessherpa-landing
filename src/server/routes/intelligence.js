const express = require('express');
const router = express.Router();

// Mock intelligence data and scoring algorithms
const intelligenceData = {
    urgencySignals: {
        'wpp-001': [
            { type: 'budget_cycle', weight: 25, signal: 'Q1 budget planning phase', impact: 'positive' },
            { type: 'hiring_surge', weight: 20, signal: '15 new marketing tech positions posted', impact: 'positive' },
            { type: 'news_mention', weight: 15, signal: 'CEO announced AI transformation initiative', impact: 'positive' },
            { type: 'competitor_activity', weight: 10, signal: 'Publicis investing heavily in AI tools', impact: 'neutral' },
            { type: 'financial_health', weight: 30, signal: 'Strong Q4 earnings, 12% YoY growth', impact: 'positive' }
        ],
        'battelle-001': [
            { type: 'contract_renewal', weight: 35, signal: 'DOE contract up for renewal in Q2', impact: 'positive' },
            { type: 'security_focus', weight: 25, signal: 'Recent cybersecurity incidents in gov sector', impact: 'positive' },
            { type: 'hiring_surge', weight: 15, signal: '5 new CISO positions posted', impact: 'positive' },
            { type: 'budget_approval', weight: 25, signal: 'Government allocated additional cybersecurity funds', impact: 'positive' }
        ],
        'salesforce-001': [
            { type: 'product_launch', weight: 20, signal: 'Einstein AI platform expansion announced', impact: 'positive' },
            { type: 'partnership_focus', weight: 30, signal: 'New strategic partnerships division created', impact: 'positive' },
            { type: 'market_pressure', weight: 15, signal: 'Increased competition from Microsoft', impact: 'neutral' },
            { type: 'financial_health', weight: 35, signal: 'Strong revenue growth but margin pressure', impact: 'neutral' }
        ]
    },
    
    actionableInsights: {
        'wpp-001': [
            {
                type: 'timing',
                priority: 'high',
                insight: 'Q1 budget cycle creates perfect timing for new technology investments',
                action: 'Schedule demo for week of Feb 20th to align with budget approval process',
                confidence: 0.87
            },
            {
                type: 'personalization',
                priority: 'high',
                insight: 'Marie-Claire Barker led similar AI transformation at previous company',
                action: 'Reference her success at Unilever with marketing automation',
                confidence: 0.91
            },
            {
                type: 'competitive',
                priority: 'medium',
                insight: 'WPP losing market share to Publicis due to tech capabilities gap',
                action: 'Position TheSalesSherpa as competitive advantage in client pitches',
                confidence: 0.73
            }
        ],
        'battelle-001': [
            {
                type: 'urgency',
                priority: 'high',
                insight: 'DOE contract renewal requires enhanced cybersecurity posture',
                action: 'Focus on data security and compliance features in presentation',
                confidence: 0.94
            },
            {
                type: 'relationship',
                priority: 'high',
                insight: 'Dr. Sarah Chen has budget authority and technical decision power',
                action: 'Leverage existing relationship for warm introduction to CISO',
                confidence: 0.89
            }
        ],
        'salesforce-001': [
            {
                type: 'partnership',
                priority: 'medium',
                insight: 'New partnerships division suggests openness to integration opportunities',
                action: 'Propose mutual go-to-market partnership rather than just integration',
                confidence: 0.76
            }
        ]
    }
};

// POST /api/intelligence/calculate-urgency - Calculate urgency score for account
router.post('/calculate-urgency', async (req, res) => {
    try {
        const { accountId, signals } = req.body;
        
        // Get signals for account or use provided signals
        const accountSignals = signals || intelligenceData.urgencySignals[accountId] || [];
        
        // Calculate weighted urgency score
        let totalScore = 0;
        let totalWeight = 0;
        
        accountSignals.forEach(signal => {
            let signalScore = 50; // Base score
            
            if (signal.impact === 'positive') {
                signalScore = Math.random() * 30 + 70; // 70-100 for positive signals
            } else if (signal.impact === 'negative') {
                signalScore = Math.random() * 30 + 20; // 20-50 for negative signals
            } else {
                signalScore = Math.random() * 20 + 40; // 40-60 for neutral signals
            }
            
            totalScore += signalScore * signal.weight;
            totalWeight += signal.weight;
        });
        
        const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
        
        // Determine priority level and color
        let priority, color;
        if (finalScore >= 90) {
            priority = 'HOT';
            color = 'red';
        } else if (finalScore >= 75) {
            priority = 'WARM';
            color = 'orange';
        } else if (finalScore >= 60) {
            priority = 'DEVELOPING';
            color = 'yellow';
        } else {
            priority = 'NURTURE';
            color = 'green';
        }
        
        res.json({
            success: true,
            data: {
                accountId,
                urgencyScore: finalScore,
                priority,
                color,
                signals: accountSignals,
                calculation: {
                    totalWeight,
                    weightedScore: totalScore,
                    methodology: 'AI-powered signal aggregation with temporal weighting'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate urgency score' });
    }
});

// GET /api/intelligence/insights/:accountId - Get actionable insights for account
router.get('/insights/:accountId', async (req, res) => {
    try {
        const accountId = req.params.accountId;
        const insights = intelligenceData.actionableInsights[accountId] || [];
        
        res.json({
            success: true,
            data: {
                accountId,
                insights,
                totalInsights: insights.length,
                highPriorityCount: insights.filter(i => i.priority === 'high').length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

// GET /api/intelligence/alerts - Get real-time alerts across all accounts
router.get('/alerts', async (req, res) => {
    try {
        const alerts = [
            {
                id: 'alert-001',
                accountId: 'wpp-001',
                accountName: 'WPP',
                type: 'budget_cycle',
                message: 'Q1 budget approval window opens Monday - schedule demo ASAP',
                urgency: 'high',
                timestamp: '2026-02-12T10:30:00Z',
                actionRequired: true,
                suggestedActions: [
                    'Email Marie-Claire Barker today',
                    'Propose demo for Feb 20-24 timeframe',
                    'Prepare ROI calculator for budget justification'
                ]
            },
            {
                id: 'alert-002',
                accountId: 'battelle-001',
                accountName: 'Battelle',
                type: 'news',
                message: 'DOE announces $2B cybersecurity initiative - perfect timing',
                urgency: 'high',
                timestamp: '2026-02-12T08:15:00Z',
                actionRequired: true,
                suggestedActions: [
                    'Call Dr. Sarah Chen about DOE funding opportunity',
                    'Prepare compliance-focused demo',
                    'Connect with Michael Torres (CISO) through Sarah'
                ]
            },
            {
                id: 'alert-003',
                accountId: 'salesforce-001',
                accountName: 'Salesforce',
                type: 'personnel',
                message: 'Jennifer Walsh promoted to SVP Strategic Partnerships',
                urgency: 'medium',
                timestamp: '2026-02-11T16:45:00Z',
                actionRequired: false,
                suggestedActions: [
                    'Send congratulations message',
                    'Explore expanded partnership opportunities',
                    'Request introduction to new partnership team'
                ]
            }
        ];
        
        const { urgency } = req.query;
        const filteredAlerts = urgency ? 
            alerts.filter(alert => alert.urgency === urgency) : 
            alerts;
        
        res.json({
            success: true,
            data: filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// GET /api/intelligence/news/:accountId - Get relevant news for account
router.get('/news/:accountId', async (req, res) => {
    try {
        const accountId = req.params.accountId;
        
        const newsData = {
            'wpp-001': [
                {
                    headline: 'WPP Announces $500M Investment in AI-Powered Creative Tools',
                    source: 'AdAge',
                    publishedAt: '2026-02-11T14:20:00Z',
                    relevance: 0.94,
                    sentiment: 'positive',
                    keyQuotes: [
                        'WPP plans to integrate AI across all client workflows by Q4 2026',
                        'CEO Mark Read: "AI will transform how we deliver value to clients"'
                    ],
                    implications: 'Strong signal for AI tool adoption and budget availability'
                },
                {
                    headline: 'WPP Q4 Earnings Beat Expectations, 12% Revenue Growth',
                    source: 'Financial Times',
                    publishedAt: '2026-02-08T09:30:00Z',
                    relevance: 0.87,
                    sentiment: 'positive',
                    keyQuotes: [
                        'Net new business of $2.1B in Q4',
                        'Technology investments driving margin expansion'
                    ],
                    implications: 'Financial strength supports new technology investments'
                }
            ],
            'battelle-001': [
                {
                    headline: 'DOE Awards Battelle $850M Contract Extension for National Lab Management',
                    source: 'Defense News',
                    publishedAt: '2026-02-10T11:15:00Z',
                    relevance: 0.96,
                    sentiment: 'positive',
                    keyQuotes: [
                        'Contract includes enhanced cybersecurity requirements',
                        'Battelle must implement next-gen security protocols by Q3'
                    ],
                    implications: 'Urgent need for advanced security and compliance tools'
                }
            ],
            'salesforce-001': [
                {
                    headline: 'Salesforce Creates New Strategic Partnerships Division',
                    source: 'TechCrunch',
                    publishedAt: '2026-02-09T13:45:00Z',
                    relevance: 0.91,
                    sentiment: 'positive',
                    keyQuotes: [
                        'Division will focus on AI and automation partnerships',
                        'Jennifer Walsh promoted to lead new 50-person team'
                    ],
                    implications: 'Increased openness to strategic technology partnerships'
                }
            ]
        };
        
        const news = newsData[accountId] || [];
        
        res.json({
            success: true,
            data: {
                accountId,
                news,
                totalArticles: news.length,
                averageRelevance: news.length > 0 ? 
                    (news.reduce((sum, article) => sum + article.relevance, 0) / news.length).toFixed(2) : 
                    0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

// GET /api/intelligence/dashboard - Get dashboard overview data
router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = {
            totalAccounts: 3,
            highPriorityAccounts: 2,
            totalAlerts: 3,
            actionableInsights: 6,
            averageUrgencyScore: 88,
            weeklyStats: {
                newOpportunities: 2,
                completedActivities: 8,
                introductionsRequested: 3,
                responseRate: 0.73
            },
            topActions: [
                {
                    priority: 'urgent',
                    action: 'Schedule WPP demo before budget window closes',
                    account: 'WPP',
                    deadline: '2026-02-15'
                },
                {
                    priority: 'high',
                    action: 'Call Dr. Sarah Chen about DOE cybersecurity funding',
                    account: 'Battelle',
                    deadline: '2026-02-14'
                },
                {
                    priority: 'medium',
                    action: 'Send congratulations to Jennifer Walsh on promotion',
                    account: 'Salesforce',
                    deadline: '2026-02-13'
                }
            ],
            recentActivities: [
                {
                    type: 'alert',
                    message: 'New high-priority alert for WPP',
                    timestamp: '2026-02-12T10:30:00Z'
                },
                {
                    type: 'news',
                    message: 'Battelle awarded major DOE contract',
                    timestamp: '2026-02-10T11:15:00Z'
                },
                {
                    type: 'relationship',
                    message: 'New connection path discovered to Salesforce',
                    timestamp: '2026-02-09T16:20:00Z'
                }
            ]
        };
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;