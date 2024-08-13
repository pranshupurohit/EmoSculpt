const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro-001"; 
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME, 
    systemInstruction: "say hi upfront, even if user doesn't say anything",
  });

  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  };

  async function run(userInput) { 
    const chatSession = model.startChat({
      generationConfig,
      history: [ 
        {
          role: "model",
          parts: [
            { text: "Hello! I'm EmoSculpt \n" },
          ],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage(userInput);
      console.log('AI Model Result:', result);

      if (result && result.response && result.response.text) {
        return result.response.text; // Access text directly if it's a string property
      } else {
        throw new Error('Invalid response structure from AI model');
      }
    } catch (error) {
      console.error('Error while sending message to AI model:', error);
      return 'Sorry, something went wrong while processing your request.';
    }
  }

  return await run(userInput); 
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
    res.status(500).json({ response: 'Sorry, something went wrong. Please try again later.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
