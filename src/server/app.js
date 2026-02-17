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

// Serve React static files FIRST
app.use(express.static(path.join(__dirname, '../../src/client/build')));

// Handle React routing (serve index.html for frontend routes ONLY)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/client/build', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/client/build', 'index.html'));
});

app.get('/demo', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/client/build', 'index.html'));
});

app.get('/accounts', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/client/build', 'index.html'));
});

// Handle FA routes (must be after static files)
app.get('/fa/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/client/build', 'index.html'));
});

// Catch-all for React Router (SPA)
app.get('*', (req, res) => {
    // Serve index.html for unknown routes (React Router will handle)
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