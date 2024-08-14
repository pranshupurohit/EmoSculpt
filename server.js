// Ensure Node.js version is >= 18
// Install dependencies: npm install @google/generative-ai express dotenv

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-latest"; // Using Gemini 1.5 Pro Latest
const API_KEY = process.env.API_KEY; // Ensure this is set in your .env file

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  const generationConfig = {
    temperature: 0,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 1000,
  };

  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    // Skipping systemInstructions as per your request
  });

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [], // Keep history empty if you don't want to include previous messages
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;

  if (response && response.text) {
    return response.text; // Return the response text
  } else {
    throw new Error('Invalid response structure from AI model');
  }
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve the loader gif
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// Handle chat requests
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('Incoming /chat req:', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
