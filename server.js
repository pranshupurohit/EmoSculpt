const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve the HTML file on the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const systemInstructions = JSON.parse(fs.readFileSync('systeminstructions.json', 'utf8'));
    const userInput = req.body.userInput;

    const conversation = `${systemInstructions.systemMessage}\nUser: ${userInput}`;

    const response = await fetch('https://api.yourservice.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation })
    });

    const data = await response.json();
    res.json({ response: data.reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
