const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Serve static files from the client directory during development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../client')));
}

// Handle API routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'JengaCAD API is running' });
});

// For all other routes, serve the main index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});