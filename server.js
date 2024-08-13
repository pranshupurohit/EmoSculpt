const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-latest"; 
const API_KEY = process.env.API_KEY;

async function testGenerativeAI() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 50,
    };

    const result = await model.generateText({
      prompt: "Hello, how are you?",
      generationConfig,
    });

    console.log('Test AI Model Result:', result);

    if (result && result.candidates && result.candidates[0].output) {
      return result.candidates[0].output; // Directly return the generated text
    } else {
      throw new Error('Invalid response structure from AI model');
    }
  } catch (error) {
    console.error('Detailed Error:', error.stack);
    return `Error Details: ${error.message}`;
  }
}

app.get('/test', async (req, res) => {
  try {
    const response = await testGenerativeAI();
    res.json({ response });
  } catch (error) {
    res.status(500).json({ response: `Sorry, something went wrong. Error Details: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
