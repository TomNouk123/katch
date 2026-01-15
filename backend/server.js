const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow all Vercel deployments (including preview URLs)
    if (origin.includes('vercel.app')) return callback(null, true);
    
    // Allow Railway
    if (origin.includes('railway.app')) return callback(null, true);
    
    // Block other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Store the latest result in memory (in production, use a database)
let latestResult = null;

// API endpoint to save the latest result
app.post('/api/result', (req, res) => {
  const { matches, timestamp } = req.body;
  
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return res.status(400).json({ error: 'Invalid result data' });
  }
  
  latestResult = {
    matches,
    timestamp: timestamp || new Date().toISOString(),
  };
  
  console.log('New result saved:', latestResult.matches.map(m => m.name).join(', '));
  
  res.json({ success: true, message: 'Result saved successfully' });
});

// API endpoint to get the latest result
app.get('/api/result', (req, res) => {
  if (!latestResult) {
    return res.status(404).json({ error: 'No result available yet' });
  }
  
  res.json(latestResult);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Katch backend server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/result - Save a new result`);
  console.log(`  GET  /api/result - Get the latest result`);
});
