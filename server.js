// Ensure Node.js version is >= 18
// Install dependencies: npm install @google/generative-ai express dotenv

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const MODEL_NAME = "gemini-1.5-pro"; // Using Gemini 1.5 Pro
const API_KEY = process.env.API_KEY; // Ensure this is set in your .env file

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: "You are EmoSculpt, a therapist specializing in personality types, including MBTI. Greet the user warmly and assist them in understanding their personality traits." // System instructions
  });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // Additional safety settings can be added here
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "model",
        parts: [{ text: "Hi! I'm EmoSculpt, your therapist. I'm here to help you understand yourself better. How can I assist you today?" }],
      },
      // Automatically send "Hi!" from the user, but do not display it in the chat
      {
        role: "user",
        parts: [{ text: "Hi!" }], // This will be sent but not displayed
      },
      {
        role: "user",
        parts: [{ text: "Can you tell me about MBTI?" }],
      },
      {
        role: "model",
        parts: [{ text: "The MBTI is a personality assessment tool that categorizes individuals into 16 different personality types based on their preferences in four dichotomies: Extraversion vs. Introversion, Sensing vs. Intuition, Thinking vs. Feeling, and Judging vs. Perceiving. Each type has unique characteristics and can help you understand your behavior and interactions with others." }],
      },
      {
        role: "user",
        parts: [{ text: "What about ENTP?" }],
      },
      {
        role: "model",
        parts: [{ text: "The ENTP personality type, also known as the 'Debater,' is characterized by their enthusiasm for exploring new ideas and engaging in intellectual discussions. ENTPs are known for their creativity, adaptability, and ability to think outside the box. They thrive on debate and often challenge the status quo, making them excellent problem solvers. If you're an ENTP, you likely enjoy brainstorming and coming up with innovative solutions." }],
      },
    ],
  });

  // Send the user's input (if any) to the chat
  const result = await chat.sendMessage(userInput);
  const response = result.response;

  if (response && response.text) {
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
