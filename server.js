const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body.userInput;

        // Load system instructions from the JSON file
        const systemInstructions = JSON.parse(fs.readFileSync('systeminstructions.json', 'utf8'));
        const systemMessage = systemInstructions.message;

        // Construct conversation with system instructions and user input
        const conversation = `${systemMessage}\nUser: ${userInput}`;

        // Send the request to the Gemini model
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-pro:generateMessage', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: {
                    text: conversation
                }
            })
        });

        const data = await response.json();

        // Send the AI's response back to the client
        res.json({ response: data.candidates[0].output });
    } catch (error) {
        console.error('Error during chat:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
