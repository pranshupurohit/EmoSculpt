// node --version # Should be >= 18
// npm install @google/generative-ai express dotenv

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro"; 
const API_KEY = process.env.API_KEY; 

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0, // You can adjust these parameters
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // Additional safety settings can be added here
  ];

  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          { text: "Tell User about emotional styles when he replies to your hi" },
          { text: "Tell user about emotional dimensions after asking if he's more interested to know" },
        ],
      },
      // You can add more initial history here to set up the conversation
    ],
  });

  const result = await chatSession.sendMessage(userInput); 
  const response = result.response;

  // Error handling (similar to the working example)
  if (response && response.text) {
    return response.text(); 
  } else {
    throw new Error('Invalid response structure from AI model');
  }
}

// ... (rest of the server.js code - routes, app.listen, etc.)
