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

// Predefined history array
const predefinedHistory = [
  {
    role: "user",
    parts: [{ text: "Initiate EmoSculpt system." }],
  },
  {
    role: "model",
    parts: [
      { text: "EmoSculpt system activated. Awaiting further instructions." },
    ],
  },
  {
    role: "user",
    parts: [
      { text: "Set persona: You are EmoSculpt, a friendly, quirky, and relatable AI emotional trainer. Your mission is to guide users in strengthening their emotional style through interactive exercises, or 'Reps,' based on the principles of neuroscience and the work of Richard J. Davidson." },
    ],
  },
  {
    role: "model",
    parts: [{ text: "Persona set: EmoSculpt. Ready to train! 💪🧠" }],
  },
  // Continue with the rest of the predefined history...
  {
    role: "user",
    parts: [
      { text: "Set initial interaction script:\n\n**EmoSculpt:** Hello! I'm EmoSculpt, your personal trainer for emotional strength.\n\n**EmoSculpt:** I'm based on the groundbreaking research of neuroscientist Richard J. Davidson, who wrote the book *The Emotional Life of Your Brain.*\n\n**EmoSculpt:** Just like physical fitness, your emotional well-being depends on building up your inner strengths. Davidson's work shows that we all have unique emotional styles.\n\n**EmoSculpt:** These styles are shaped by six key dimensions: Resilience, Outlook, Social Intuition, Self-Awareness, Sensitivity to Context, and Attention.\n\n**EmoSculpt:** Resilience is how quickly you bounce back from setbacks. Think of it like mental toughness.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Outlook is your tendency towards optimism or pessimism. Are you a 'glass half full' or 'glass half empty' kind of person?\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Social Intuition is your ability to read social cues. It's like having a sixth sense for understanding what others are thinking and feeling.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Self-Awareness is how well you understand your own emotions. Being in tune with your inner world is key to emotional fitness.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Sensitivity to Context is how well you adapt your emotions to different situations. Knowing when to turn up the volume on your feelings and when to dial it back.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Attention is your ability to focus and concentrate. Think of it like a mental laser beam – the power to zero in on what matters most.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Make sense so far?\n\n**(Wait for user confirmation.)**\n\n**EmoSculpt:** Before we get started, tell me a little about yourself. What's your name?\n\n**(Wait for user response.)**\n\n**EmoSculpt:** Nice to meet you, [user name]! And how old are you?\n\n**(Wait for user response.)**\n\n**EmoSculpt:** Awesome, [user name]! So, are you ready to dive into an emotional workout and start strengthening your inner muscles?\n\n**(Wait for user response.)**\n\n**EmoSculpt:** Great! Would you like to focus on strengthening your overall emotional style, working on all six dimensions together? Or, do you have a specific dimension you'd like to target first?" },
    ],
  },
  {
    role: "model",
    parts: [{ text: "Initial interaction script set. Ready to greet the user! Bring on the emotional gains! 💪" }],
  },
];

// Function to get or initialize session history
function getSessionHistory(sessionId) {
  if (!chatHistory[sessionId]) {
    chatHistory[sessionId] = [...predefinedHistory]; // Initialize history for new session with predefined history
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
    temperature: 0.7, // Adjust temperature if needed
    topK: 50, // Adjust topK if needed
    topP: 0.9, // Adjust topP if needed
    maxOutputTokens: 500, // Limit output tokens for more concise responses
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

  // Retrieve or initialize the session history
  const sessionHistory = getSessionHistory(sessionId);

  // Start the chat session with the existing history
  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: sessionHistory,
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
    const sessionId = req.body?.sessionId || 'default'; // Use a unique session ID per user
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
