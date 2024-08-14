const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Load instructions from JSON file
const instructionsPath = path.join(__dirname, 'systeminstructions.json');
let instructions = {};
try {
  instructions = JSON.parse(fs.readFileSync(instructionsPath, 'utf8'));
} catch (error) {
  console.error('Error loading instructions from JSON:', error);
}

const MODEL_NAME = "gemini-1.5-pro-latest"; // Replace with your actual model name
const API_KEY = process.env.API_KEY; // Ensure this is set in your .env file

async function runChat(userInput) {
  try {
    console.log('Running chat with input:', userInput);
    const genAI = new GoogleGenerativeAI(API_KEY);

    const generationConfig = {
      temperature: 0,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 1000,
    };

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME
    });

    // Apply safety settings from JSON file
    const safetySettings = instructions.safetySettings || [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      // Additional safety settings can be added here
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [], // Keep history empty if you don't want to include previous messages
    });

    // Send the user's input (if any) to the chat
    const result = await chat.sendMessage(userInput);
    const response = result.response;

    console.log('Chat result:', result);
    console.log('Response:', response);

    if (response && response.text) {
      return response.text(); // Ensure this returns the correct text
    } else {
      throw new Error('Invalid response structure from AI model');
    }
  } catch (error) {
    console.error('Error in runChat:', error);
    throw error; // Re-throw the error for the outer catch block to handle
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
