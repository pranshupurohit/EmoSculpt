// Ensure Node.js version is >= 18
// Install dependencies: npm install @google/generative-ai express dotenv

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-latest"; 
const API_KEY = process.env.API_KEY;

// Initialize chat history
let chatHistory = [
  {
    role: "model",
    parts: [{ text: "Hello! I'm EmoSculpt. How can I assist you today?" }],
  },
];

// Function to run the chat
async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: "Say hi upfront, even if the user doesn't say anything",
  });

  const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  };

  const chatSession = model.startChat({
    generationConfig,
    history: chatHistory,
  });

  try {
    const result = await chatSession.sendMessage(userInput);
    const responseText = result.response.text();

    // Update chat history with user input and model response
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    return responseText;
  } catch (error) {
    console.error('Error while sending message to AI model:', error);
    throw new Error('Failed to get a response from the AI model.');
  }
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve loader GIF
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// Handle chat requests
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput?.trim(); // Trim whitespace from input
    console.log('Incoming /chat req:', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body: userInput is required.' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
