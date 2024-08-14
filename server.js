const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use dynamic import for node-fetch
async function fetchRequest(url, options) {
  const fetch = await import('node-fetch').then(mod => mod.default);
  return fetch(url, options);
}

app.use(express.json());

app.post('/chat', async (req, res) => {
  const userInput = req.body.userInput;

  // Load system instructions from JSON file
  const fs = require('fs');
  const systemInstructions = JSON.parse(fs.readFileSync('systeminstructions.json', 'utf8'));
  const systemMessage = systemInstructions.systemMessage;
  const conversation = `${systemMessage}\nUser: ${userInput}`;

  const modelOptions = {
    model: 'YOUR_MODEL_ID', // Replace with your model ID
    messages: [{ role: 'system', content: conversation }],
    max_tokens: 100
  };

  try {
    const response = await fetchRequest('https://api.generativelanguage.googleapis.com/v1beta2/models/YOUR_MODEL_ID:generateMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modelOptions)
    });

    const data = await response.json();
    const botMessage = data.choices[0].message.content;
    res.json({ response: botMessage });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
