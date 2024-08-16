const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-latest"; 
const API_KEY = process.env.API_KEY; 

const chatHistory = {}; 

function getSessionHistory(sessionId) {
  if (!chatHistory[sessionId]) {
    chatHistory[sessionId] = [];
  }
  return chatHistory[sessionId];
}

function addMessageToHistory(sessionId, message) {
  const history = getSessionHistory(sessionId);
  history.push(message);
}

const predefinedHistory = [
  // Your predefined history here
];

async function runChat(userInput, sessionId) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const generationConfig = {
    temperature: 0.7,
    topK: 50,
    topP: 0.9,
    maxOutputTokens: 1000,
  };

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  let history = getSessionHistory(sessionId);

  if (history.length === 0) {
    history = [...predefinedHistory];
  }

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history,
  });

  try {
    const result = await chat.sendMessage(userInput);
    const response = result.response;

    if (response && response.text) {
      addMessageToHistory(sessionId, { role: 'user', parts: [{ text: userInput }] });
      addMessageToHistory(sessionId, { role: 'model', parts: [{ text: response.text }] });
      return response.text;
    } else {
      throw new Error('Invalid response structure from AI model');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    const sessionId = req.body?.sessionId || 'default'; 

    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }

    console.log(`Received message: ${userInput} for session: ${sessionId}`);
    const response = await runChat(userInput, sessionId);
    console.log(`Response: ${response}`);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
