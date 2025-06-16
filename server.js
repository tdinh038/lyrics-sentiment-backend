// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // In production, restrict to your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Service is running');
});

// Sentiment analysis endpoint
app.post('/api/analyze-sentiment', async (req, res) => {
    try {
        const { sentences } = req.body;

        if (!sentences || !Array.isArray(sentences)) {
            return res.status(400).json({ error: 'Invalid input: sentences must be an array' });
        }

        const response = await axios.post(
            `${process.env.AZURE_ENDPOINT}/text/analytics/v3.1/sentiment`,
            {
                documents: sentences.map((sentence, index) => ({
                    id: index.toString(),
                    language: 'en',
                    text: sentence.text
                }))
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': process.env.AZURE_API_KEY
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({
            error: 'Failed to analyze sentiment',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});