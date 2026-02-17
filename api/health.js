module.exports = function handler(req, res) {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    demo_mode: process.env.DEMO_MODE === 'true',
    services: {
      api: 'operational',
      database: 'operational',
      auth: 'operational'
    }
  };

  return res.status(200).json(healthStatus);
};