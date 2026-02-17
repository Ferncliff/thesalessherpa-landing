const express = require('express');
const router = express.Router();
const { calculateUrgencyScore, getAccountIntelligence } = require('../services/intelligenceService');
const { findRelationshipPaths } = require('../services/relationshipService');

// Mock data for demo - In production, this would come from a database
const mockAccounts = [
    {
        id: 'wpp-001',
        name: 'WPP',
        industry: 'Advertising & Marketing',
        size: 'Large Enterprise',
        revenue: '$15.4B',
        employees: '109,000+',
        urgencyScore: 95,
        priority: 'HOT',
        color: 'red',
        lastActivity: '2026-01-15',
        nextAction: '2026-02-20',
        description: 'Global advertising and marketing services company',
        headquarters: 'London, UK',
        website: 'https://www.wpp.com',
        contacts: [
            {
                id: 'mc-barker',
                name: 'Marie-Claire Barker',
                title: 'Chief Marketing Officer',
                separationDegree: 2,
                connectionPath: 'You → Sarah Johnson (Former Colleague) → Marie-Claire Barker',
                influence: {
                    budget: 90,
                    technical: 65,
                    relationship: 85,
                    urgency: 75
                },
                email: 'mc.barker@wpp.com',
                linkedin: 'https://linkedin.com/in/mcbarker'
            },
            {
                id: 'david-rodriguez',
                name: 'David Rodriguez',
                title: 'VP Marketing Technology',
                separationDegree: 3,
                connectionPath: 'You → John Smith → Lisa Chen → David Rodriguez',
                influence: {
                    budget: 70,
                    technical: 95,
                    relationship: 60,
                    urgency: 80
                },
                email: 'd.rodriguez@wpp.com',
                linkedin: 'https://linkedin.com/in/drodriguez-wpp'
            }
        ],
        alerts: [
            {
                type: 'budget',
                message: 'Q1 budget cycle + hiring spree detected',
                urgency: 'high',
                date: '2026-02-10'
            },
            {
                type: 'news',
                message: 'WPP announces AI initiative expansion',
                urgency: 'medium',
                date: '2026-02-08'
            }
        ],
        activities: [
            {
                date: '2026-01-15',
                type: 'email',
                contact: 'Marie-Claire Barker',
                subject: 'AI transformation discussion',
                status: 'sent'
            },
            {
                date: '2026-01-08',
                type: 'linkedin',
                contact: 'David Rodriguez',
                subject: 'MarTech innovation trends',
                status: 'viewed'
            }
        ]
    },
    {
        id: 'battelle-001',
        name: 'Battelle',
        industry: 'Research & Development',
        size: 'Large Enterprise',
        revenue: '$6.8B',
        employees: '25,000+',
        urgencyScore: 92,
        priority: 'WARM',
        color: 'orange',
        lastActivity: '2025-12-03',
        nextAction: 'OVERDUE',
        description: 'Science and technology development company',
        headquarters: 'Columbus, OH',
        website: 'https://www.battelle.org',
        contacts: [
            {
                id: 'sarah-chen',
                name: 'Dr. Sarah Chen',
                title: 'Chief Technology Officer',
                separationDegree: 1,
                connectionPath: 'Direct connection - worked together at DOE Lab',
                influence: {
                    budget: 85,
                    technical: 98,
                    relationship: 92,
                    urgency: 88
                },
                email: 's.chen@battelle.org',
                linkedin: 'https://linkedin.com/in/sarahchen-cto'
            },
            {
                id: 'michael-torres',
                name: 'Michael Torres',
                title: 'Chief Information Security Officer',
                separationDegree: 4,
                connectionPath: 'You → Alex Kim → Jennifer Park → Tom Wilson → Michael Torres',
                influence: {
                    budget: 75,
                    technical: 88,
                    relationship: 65,
                    urgency: 95
                },
                email: 'm.torres@battelle.org',
                linkedin: 'https://linkedin.com/in/mtorres-security'
            }
        ],
        alerts: [
            {
                type: 'contract',
                message: 'DOE contract renewal + security focus',
                urgency: 'high',
                date: '2026-02-12'
            },
            {
                type: 'hiring',
                message: 'Posted 5 new cybersecurity positions',
                urgency: 'medium',
                date: '2026-02-09'
            }
        ],
        activities: [
            {
                date: '2025-12-03',
                type: 'call',
                contact: 'Dr. Sarah Chen',
                subject: 'Quarterly technology review',
                status: 'completed'
            }
        ]
    },
    {
        id: 'salesforce-001',
        name: 'Salesforce',
        industry: 'Software & Technology',
        size: 'Large Enterprise',
        revenue: '$31.3B',
        employees: '79,000+',
        urgencyScore: 78,
        priority: 'DEVELOPING',
        color: 'yellow',
        lastActivity: '2026-01-22',
        nextAction: '2026-02-15',
        description: 'Leading CRM and cloud computing company',
        headquarters: 'San Francisco, CA',
        website: 'https://www.salesforce.com',
        contacts: [
            {
                id: 'jennifer-walsh',
                name: 'Jennifer Walsh',
                title: 'VP Strategic Partnerships',
                separationDegree: 2,
                connectionPath: 'You → Mark Thompson (Former Manager) → Jennifer Walsh',
                influence: {
                    budget: 88,
                    technical: 70,
                    relationship: 90,
                    urgency: 65
                },
                email: 'j.walsh@salesforce.com',
                linkedin: 'https://linkedin.com/in/jwalsh-sf'
            }
        ],
        alerts: [
            {
                type: 'product',
                message: 'Einstein AI platform expansion announcement',
                urgency: 'medium',
                date: '2026-02-11'
            }
        ],
        activities: [
            {
                date: '2026-01-22',
                type: 'demo',
                contact: 'Jennifer Walsh',
                subject: 'Partnership opportunity presentation',
                status: 'scheduled'
            }
        ]
    }
];

// GET /api/accounts - Get all accounts with urgency scoring
router.get('/', async (req, res) => {
    try {
        // Sort accounts by urgency score (highest first)
        const sortedAccounts = mockAccounts.sort((a, b) => b.urgencyScore - a.urgencyScore);
        
        res.json({
            success: true,
            data: sortedAccounts,
            meta: {
                total: sortedAccounts.length,
                avgUrgencyScore: Math.round(sortedAccounts.reduce((sum, acc) => sum + acc.urgencyScore, 0) / sortedAccounts.length)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// GET /api/accounts/:id - Get specific account details
router.get('/:id', async (req, res) => {
    try {
        const account = mockAccounts.find(acc => acc.id === req.params.id);
        
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({
            success: true,
            data: account
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch account details' });
    }
});

// GET /api/accounts/:id/relationships - Get relationship map for account
router.get('/:id/relationships', async (req, res) => {
    try {
        const account = mockAccounts.find(acc => acc.id === req.params.id);
        
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const relationshipPaths = account.contacts.map(contact => ({
            contactId: contact.id,
            name: contact.name,
            title: contact.title,
            separationDegree: contact.separationDegree,
            connectionPath: contact.connectionPath,
            influence: contact.influence,
            introSuccessRate: Math.max(85 - (contact.separationDegree - 1) * 15, 35)
        }));

        res.json({
            success: true,
            data: {
                accountId: account.id,
                accountName: account.name,
                relationships: relationshipPaths
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch relationship data' });
    }
});

// POST /api/accounts/:id/actions - Record new activity
router.post('/:id/actions', async (req, res) => {
    try {
        const { type, contactId, subject, notes } = req.body;
        const account = mockAccounts.find(acc => acc.id === req.params.id);
        
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const contact = account.contacts.find(c => c.id === contactId);
        const activity = {
            date: new Date().toISOString().split('T')[0],
            type,
            contact: contact ? contact.name : 'Unknown',
            subject,
            notes,
            status: 'completed'
        };

        account.activities.unshift(activity);
        account.lastActivity = activity.date;

        res.json({
            success: true,
            message: 'Activity recorded successfully',
            data: activity
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record activity' });
    }
});

module.exports = router;