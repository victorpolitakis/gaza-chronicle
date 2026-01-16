// Simple Express server to serve the SPA and proxy BBC API requests

const express = require('express');
const path = require('path');
const { fetchBBCTopic } = require('./fetch-bbc-topic.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// API endpoint to fetch BBC topic news
app.get('/api/news', async (req, res) => {
    try {
        const topicId = req.query.topic || 'c2vdnvdg6xxt'; // Default: Israel-Gaza war
        const data = await fetchBBCTopic(topicId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching BBC news:', error);
        res.status(500).json({ error: 'Failed to fetch news', message: error.message });
    }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 BBC Headlines Server Running!                         ║
║                                                            ║
║   Local:   http://localhost:${PORT}                          ║
║                                                            ║
║   Press Ctrl+C to stop                                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
