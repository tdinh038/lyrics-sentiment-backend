// Sentiment analysis endpoint
app.post('/api/analyze-sentiment', async (req, res) => {
    try {
        const { sentences } = req.body;

        if (!sentences || !Array.isArray(sentences)) {
            return res.status(400).json({ error: 'Invalid input: sentences must be an array' });
        }

        // Fix potential trailing slash issues
        const endpoint = process.env.AZURE_ENDPOINT.endsWith('/')
            ? process.env.AZURE_ENDPOINT + 'text/analytics/v3.1/sentiment'
            : process.env.AZURE_ENDPOINT + '/text/analytics/v3.1/sentiment';

        console.log('Calling Azure endpoint:', endpoint);
        console.log('Sending data:', JSON.stringify({
            documents: sentences.map((sentence, index) => ({
                id: index.toString(),
                language: 'en',
                text: sentence.text
            }))
        }));

        const response = await axios.post(
            endpoint,
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

        // More detailed error logging
        if (error.response) {
            console.error('Error response from Azure:', error.response.data);
            console.error('Status code:', error.response.status);
        }

        res.status(500).json({
            error: 'Failed to analyze sentiment',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
        });
    }
});