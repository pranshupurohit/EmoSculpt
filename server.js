const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-001"; 
const API_KEY = process.env.API_KEY;

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput; // Access userInput directly
    console.log('Incoming /chat req:', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateText({
      prompt: userInput,
      maxOutputTokens: 100,
    });

    console.log('AI Model Result:', result);

    if (result && result.generated_text) {
      res.json({ response: result.generated_text });
    } else {
      throw new Error('Invalid response structure from AI model');
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ response: 'Sorry, something went wrong. Please try again later.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
