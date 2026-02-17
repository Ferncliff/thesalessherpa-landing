const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TheSalesSherpa API is running',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// Mock accounts endpoint
app.get('/api/accounts', (req, res) => {
  res.json({
    accounts: [
      {
        id: 'wpp-001',
        name: 'WPP',
        urgency: 95,
        intelligence: 'High-value creative agency deal',
        contact: 'Marie-Claire Barker'
      },
      {
        id: 'battelle-001',
        name: 'Battelle Memorial Institute',
        urgency: 92,
        intelligence: 'DOE contract renewal opportunity',
        contact: 'Dr. Sarah Chen'
      },
      {
        id: 'salesforce-001',
        name: 'Salesforce',
        urgency: 88,
        intelligence: 'CRM expansion project',
        contact: 'Michael Rodriguez'
      }
    ]
  });
});

// Mock account details endpoint
app.get('/api/accounts/:id', (req, res) => {
  const accountId = req.params.id;
  
  const mockAccount = {
    id: accountId,
    name: accountId === 'wpp-001' ? 'WPP' : 'Sample Account',
    urgency: 95,
    intelligence: 'High-value opportunity detected',
    contact: 'Marie-Claire Barker',
    relationships: [
      {
        name: 'Marie-Claire Barker',
        title: 'VP of Creative Operations',
        connection: '2° via LinkedIn',
        strength: 'Strong'
      }
    ]
  };
  
  res.json(mockAccount);
});

// Export for Vercel
module.exports = app;