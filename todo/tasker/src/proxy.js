const express = require('express');
const axios = require('axios');

const app = express();
const port = 3001; // Choose an available port

const GEMINI_API_URL = 'https://api.gemini.ai/v1/summarization';

app.get('/summarize', async (req, res) => {
    const { text } = req.query;

    try {
        const response = await axios.post(GEMINI_API_URL, { text }, {
            headers: {
                'Authorization': 'key=AIzaSyDo1WMRZmuB-vUZ_8edfHt3HO1mCvcPGG4'
            }
        });

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow requests from your React app
        res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow GET requests (adjust if needed)
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow content type header (adjust if needed)
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching summary');
    }
});

app.listen(port, () => console.log(`Proxy server listening on port ${port}`));
