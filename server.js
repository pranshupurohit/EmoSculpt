const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-latest"; // Using Gemini 1.5 Pro Latest
const API_KEY = process.env.API_KEY; // Ensure this is set in your .env file

// In-memory history storage
const chatHistory = {}; // Object to store chat history by session ID

// Function to get or initialize session history
function getSessionHistory(sessionId) {
  if (!chatHistory[sessionId]) {
    chatHistory[sessionId] = []; // Initialize history for new session
  }
  return chatHistory[sessionId];
}

// Function to add a message to the history
function addMessageToHistory(sessionId, message) {
  const history = getSessionHistory(sessionId);
  history.push(message);
}

async function runChat(userInput, sessionId) {
  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: 0,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 1000,
  };

  // Initialize the model
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME
  });

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // Start the chat session with the existing history
  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: getSessionHistory(sessionId) // Use the stored history for the session
  });

  // Send the user's input (if any) to the chat
  const result = await chat.sendMessage(userInput);
  const response = result.response;

  if (response && response.text) {
    // Add both user input and AI response to history
    addMessageToHistory(sessionId, { user: userInput, bot: response.text });
    return response.text(); // Ensure this returns the correct text
  } else {
    throw new Error('Invalid response structure from AI model');
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// Chat endpoint with session management
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    const sessionId = req.body?.sessionId || 'default'; // You can use a unique session ID per user
    console.log('Incoming /chat req:', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput, sessionId);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
