const express = require('express');
const router = express.Router();

// Mock Salesforce integration - in production would use jsforce
const salesforceData = {
    connectionStatus: {
        isConnected: true,
        orgId: '00D000000000062EAA',
        orgName: 'First Advantage',
        userName: 'matt.edwards@fadv.com',
        lastSync: '2026-02-12T09:15:00Z',
        apiVersion: '59.0'
    },
    
    exportTemplates: {
        account: {
            objectType: 'Account',
            fields: [
                'Name', 'Industry', 'NumberOfEmployees', 'AnnualRevenue',
                'Website', 'Description', 'BillingCity', 'BillingState',
                'TheSalesSherpa_Urgency_Score__c', 'TheSalesSherpa_Priority__c',
                'TheSalesSherpa_Last_Intelligence_Update__c'
            ]
        },
        contact: {
            objectType: 'Contact',
            fields: [
                'FirstName', 'LastName', 'Title', 'Email', 'Phone',
                'AccountId', 'LinkedIn_URL__c', 'TheSalesSherpa_Separation_Degree__c',
                'TheSalesSherpa_Connection_Path__c', 'TheSalesSherpa_Influence_Score__c'
            ]
        },
        opportunity: {
            objectType: 'Opportunity',
            fields: [
                'Name', 'AccountId', 'StageName', 'Amount', 'CloseDate',
                'Probability', 'Description', 'LeadSource',
                'TheSalesSherpa_Source__c', 'TheSalesSherpa_Urgency_Basis__c'
            ]
        },
        task: {
            objectType: 'Task',
            fields: [
                'Subject', 'Description', 'ActivityDate', 'Priority',
                'WhoId', 'WhatId', 'Status',
                'TheSalesSherpa_AI_Generated__c', 'TheSalesSherpa_Insight_Type__c'
            ]
        }
    }
};

// GET /api/salesforce/status - Check Salesforce connection status
router.get('/status', async (req, res) => {
    try {
        res.json({
            success: true,
            data: salesforceData.connectionStatus
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check Salesforce status' });
    }
});

// POST /api/salesforce/export/:accountId - Export account to Salesforce
router.post('/export/:accountId', async (req, res) => {
    try {
        const accountId = req.params.accountId;
        const { includeContacts = true, includeOpportunity = false, includeTasks = true } = req.body;
        
        // Mock account data - would come from database in production
        const accountData = {
            'wpp-001': {
                name: 'WPP',
                industry: 'Advertising & Marketing',
                employees: 109000,
                revenue: 15400000000,
                website: 'https://www.wpp.com',
                description: 'Global advertising and marketing services company',
                city: 'London',
                state: 'England',
                urgencyScore: 95,
                priority: 'HOT'
            }
        };
        
        const account = accountData[accountId];
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        // Simulate Salesforce export process
        const exportResult = {
            accountId: `SF-${Date.now()}-ACC`,
            exported: {
                account: {
                    id: `SF-${Date.now()}-ACC`,
                    name: account.name,
                    status: 'created'
                }
            }
        };
        
        // Export contacts if requested
        if (includeContacts) {
            exportResult.exported.contacts = [
                {
                    id: `SF-${Date.now()}-CON1`,
                    name: 'Marie-Claire Barker',
                    title: 'Chief Marketing Officer',
                    email: 'mc.barker@wpp.com',
                    separationDegree: 2,
                    connectionPath: 'You → Sarah Johnson → Marie-Claire Barker',
                    influenceScore: 85,
                    status: 'created'
                },
                {
                    id: `SF-${Date.now()}-CON2`,
                    name: 'David Rodriguez',
                    title: 'VP Marketing Technology',
                    email: 'd.rodriguez@wpp.com',
                    separationDegree: 3,
                    connectionPath: 'You → John Smith → Lisa Chen → David Rodriguez',
                    influenceScore: 78,
                    status: 'created'
                }
            ];
        }
        
        // Create opportunity if requested
        if (includeOpportunity) {
            exportResult.exported.opportunity = {
                id: `SF-${Date.now()}-OPP`,
                name: `${account.name} - Sales Intelligence Platform`,
                stage: 'Prospecting',
                amount: 150000,
                closeDate: '2026-06-30',
                probability: 20,
                source: 'TheSalesSherpa',
                urgencyBasis: 'Q1 budget cycle + AI initiative announcement',
                status: 'created'
            };
        }
        
        // Create follow-up tasks if requested
        if (includeTasks) {
            exportResult.exported.tasks = [
                {
                    id: `SF-${Date.now()}-TSK1`,
                    subject: 'Schedule demo with Marie-Claire Barker',
                    description: 'Q1 budget cycle creates perfect timing for new technology investments. Reference her success at Unilever with marketing automation.',
                    priority: 'High',
                    dueDate: '2026-02-15',
                    contactId: exportResult.exported.contacts?.[0]?.id,
                    aiGenerated: true,
                    insightType: 'timing',
                    status: 'created'
                },
                {
                    id: `SF-${Date.now()}-TSK2`,
                    subject: 'Prepare competitive positioning vs Publicis',
                    description: 'WPP losing market share to Publicis due to tech capabilities gap. Position TheSalesSherpa as competitive advantage.',
                    priority: 'Medium',
                    dueDate: '2026-02-18',
                    contactId: exportResult.exported.contacts?.[1]?.id,
                    aiGenerated: true,
                    insightType: 'competitive',
                    status: 'created'
                }
            ];
        }
        
        res.json({
            success: true,
            message: 'Account successfully exported to Salesforce',
            data: exportResult,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to export to Salesforce' });
    }
});

// GET /api/salesforce/mapping/:objectType - Get field mapping for Salesforce object
router.get('/mapping/:objectType', async (req, res) => {
    try {
        const objectType = req.params.objectType;
        const mapping = salesforceData.exportTemplates[objectType];
        
        if (!mapping) {
            return res.status(404).json({ error: 'Object type not supported' });
        }
        
        res.json({
            success: true,
            data: {
                objectType: mapping.objectType,
                fields: mapping.fields,
                customFields: mapping.fields.filter(field => field.includes('TheSalesSherpa')),
                standardFields: mapping.fields.filter(field => !field.includes('TheSalesSherpa'))
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch field mapping' });
    }
});

// POST /api/salesforce/sync - Sync data from Salesforce
router.post('/sync', async (req, res) => {
    try {
        const { objectTypes = ['Account', 'Contact', 'Opportunity'], lastSync } = req.body;
        
        // Simulate sync process
        const syncResult = {
            syncId: `sync-${Date.now()}`,
            startedAt: new Date().toISOString(),
            status: 'completed',
            summary: {
                accounts: { fetched: 1250, updated: 47, errors: 0 },
                contacts: { fetched: 3890, updated: 156, errors: 2 },
                opportunities: { fetched: 234, updated: 18, errors: 0 }
            },
            errors: [
                {
                    objectType: 'Contact',
                    recordId: 'CON-001',
                    error: 'Invalid email format',
                    action: 'skipped'
                },
                {
                    objectType: 'Contact', 
                    recordId: 'CON-087',
                    error: 'Duplicate LinkedIn URL',
                    action: 'skipped'
                }
            ],
            completedAt: new Date(Date.now() + 45000).toISOString(), // 45 seconds later
            nextSyncRecommended: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        
        res.json({
            success: true,
            message: 'Salesforce sync completed successfully',
            data: syncResult
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync with Salesforce' });
    }
});

// GET /api/salesforce/recent-exports - Get recent export history
router.get('/recent-exports', async (req, res) => {
    try {
        const recentExports = [
            {
                id: 'exp-001',
                accountName: 'WPP',
                objectsExported: ['Account', 'Contact', 'Task'],
                recordsCreated: 4,
                exportedBy: 'Matt Edwards',
                exportedAt: '2026-02-12T14:30:00Z',
                salesforceIds: {
                    account: 'SF-001-ACC',
                    contacts: ['SF-001-CON1', 'SF-001-CON2'],
                    tasks: ['SF-001-TSK1']
                }
            },
            {
                id: 'exp-002',
                accountName: 'Battelle',
                objectsExported: ['Account', 'Contact', 'Opportunity'],
                recordsCreated: 3,
                exportedBy: 'Matt Edwards',
                exportedAt: '2026-02-10T11:15:00Z',
                salesforceIds: {
                    account: 'SF-002-ACC',
                    contacts: ['SF-002-CON1'],
                    opportunity: 'SF-002-OPP'
                }
            }
        ];
        
        res.json({
            success: true,
            data: recentExports
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch export history' });
    }
});

// POST /api/salesforce/configure - Configure Salesforce integration settings
router.post('/configure', async (req, res) => {
    try {
        const { 
            autoExportThreshold = 85,
            syncFrequency = 'daily',
            defaultStage = 'Prospecting',
            customFieldMappings = {}
        } = req.body;
        
        const configuration = {
            autoExportThreshold,
            syncFrequency,
            defaultStage,
            customFieldMappings,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Matt Edwards'
        };
        
        res.json({
            success: true,
            message: 'Salesforce integration configured successfully',
            data: configuration
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to configure Salesforce integration' });
    }
});

// GET /api/salesforce/health - Check integration health and performance
router.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            lastApiCall: '2026-02-12T14:45:00Z',
            apiCallsToday: 847,
            dailyLimit: 50000,
            utilizationPercent: 1.7,
            errorRate24h: 0.003,
            avgResponseTime: 245,
            connectionLatency: 78,
            features: {
                export: { status: 'active', lastUsed: '2026-02-12T14:30:00Z' },
                sync: { status: 'active', lastUsed: '2026-02-12T09:15:00Z' },
                webhooks: { status: 'pending', lastUsed: null },
                realTimeUpdates: { status: 'disabled', lastUsed: null }
            },
            uptime: '99.97%',
            lastDowntime: '2026-01-15T03:22:00Z'
        };
        
        res.json({
            success: true,
            data: healthData
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check integration health' });
    }
});

module.exports = router;