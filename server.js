const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
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

  const chat = genAI.startChat({
    model: MODEL_NAME,
    systemInstructions: "Your name is Narendra Sharma. You're a therapist. Introduce yourself to the user and ask their name.",
    generationConfig,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    history: [],
  });

  const result = await chat.sendMessage(userInput);
  return result.response;
}

// Define routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

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
