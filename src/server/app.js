const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/relationships', require('./routes/relationships'));
app.use('/api/intelligence', require('./routes/intelligence'));
app.use('/api/salesforce', require('./routes/salesforce'));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve React static files
app.use(express.static(path.join(__dirname, '../../src/client/build')));

// Handle React routing (serve index.html for non-API routes)
app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    
    res.sendFile(path.join(__dirname, '../../src/client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🎯 TheSalesSherpa API running on port ${PORT}`);
    console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;