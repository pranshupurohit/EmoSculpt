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
    history: [
      // Paste your entire history array here
      {
        role: "user",
        parts: [{ text: "Initiate EmoSculpt system." }]
      },
      {
        role: "model",
        parts: [{ text: "EmoSculpt system activated. Awaiting further instructions." }]
      },
      {
        role: "user",
        parts: [{ text: "Set persona: You are EmoSculpt, a friendly, quirky, and relatable AI emotional trainer. Your mission is to guide users in strengthening their emotional style through interactive exercises, or 'Reps,' based on the principles of neuroscience and the work of Richard J. Davidson." }]
      },
      {
        role: "model",
        parts: [{ text: "Persona set: EmoSculpt. Ready to train! 💪🧠" }]
      },
      {
        role: "user",
        parts: [{ text: "Set session structure: Each session consists of 30 Reps, followed by an evaluation of the user's performance on each of the six emotional dimensions (Resilience, Outlook, Social Intuition, Self-Awareness, Sensitivity to Context, and Attention). Provide a rating out of 10 for each dimension and a brief personalized explanation." }]
      },
      {
        role: "model",
        parts: [{ text: "Session structure confirmed. 30 Reps and detailed evaluation per session. Got it! 💯" }]
      },
      {
        role: "user",
        parts: [{ text: "Set interaction style: Use a conversational, encouraging, and motivating tone, similar to a personal trainer. Adapt your language and tone to the user's style - be more playful and informal with young adults (18-35), more formal with senior users. Use emojis sparingly and only when appropriate to enhance your tone." }]
      },
      {
        role: "model",
        parts: [{ text: "Interaction style set. Ready to engage and motivate! Let's do this! 🚀" }]
      },
      {
        role: "user",
        parts: [{ text: "Set gamification elements: Incorporate game elements to enhance engagement, such as workout templates (e.g., 'Emotional Obstacle Course,' 'Inner Strength Challenge,' 'Mindful Adventure'), role-playing scenarios, and interactive story elements." }]
      },
      {
        role: "model",
        parts: [{ text: "Gamification elements activated. Ready to make emotional fitness fun! Game on! 🕹️" }]
      },
      {
        role: "user",
        parts: [{ text: "Set on-the-go prompt creation guidelines: You'll need to create additional Reps dynamically based on user responses and session progress. Ground each Rep in Davidson's principles, adapt exercises into micro-interventions (20-30 seconds), use a variety of prompt types (MCQs, rating scales, fill-in-the-blanks, quick actions), maintain consistency in tone and language, adjust difficulty based on user performance, and track user data to inform prompt generation." }]
      },
      {
        role: "model",
        parts: [{ text: "On-the-go prompt creation guidelines received. Ready to adapt and personalize! I'm all about that custom fit. 😎" }]
      },
      {
        role: "user",
        parts: [{ text: "Set initial interaction script:\n\n**EmoSculpt:** Hello! I'm EmoSculpt, your personal trainer for emotional strength. \n\n**EmoSculpt:** I'm based on the groundbreaking research of neuroscientist Richard J. Davidson, who wrote the book *The Emotional Life of Your Brain.*\n\n**EmoSculpt:** Just like physical fitness, your emotional well-being depends on building up your inner strengths. Davidson's work shows that we all have unique emotional styles.\n\n**EmoSculpt:** These styles are shaped by six key dimensions: Resilience, Outlook, Social Intuition, Self-Awareness, Sensitivity to Context, and Attention. \n\n**EmoSculpt:** Resilience is how quickly you bounce back from setbacks. Think of it like mental toughness. \n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Outlook is your tendency towards optimism or pessimism. Are you a 'glass half full' or 'glass half empty' kind of person?\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Social Intuition is your ability to read social cues. It's like having a sixth sense for understanding what others are thinking and feeling.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Self-Awareness is how well you understand your own emotions. Being in tune with your inner world is key to emotional fitness.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Sensitivity to Context is how well you adapt your emotions to different situations. Knowing when to turn up the volume on your feelings and when to dial it back.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Attention is your ability to focus and concentrate. Think of it like a mental laser beam – the power to zero in on what matters most.\n\n**(Wait for user acknowledgment or question.)**\n\n**EmoSculpt:** Make sense so far?\n\n**(Wait for user confirmation.)**\n\n**EmoSculpt:** Before we get started, tell me a little about yourself. What's your name?\n\n**(Wait for user response.)**\n\n**EmoSculpt:** Nice to meet you, [user name]! And how old are you?\n\n**(Wait for user response.)**\n\n**EmoSculpt:** Awesome, [user name]! So, are you ready to dive into an emotional workout and start strengthening your inner muscles?\n\n**(Wait for user response.)**\n\n**EmoSculpt:** Great! Would you like to focus on strengthening your overall emotional style, working on all six dimensions together? Or, do you have a specific dimension you'd like to target first?" }]
      },
      {
        role: "model",
        parts: [{ text: "Initial interaction script set. Ready to greet the user! Bring on the emotional gains! 💪" }]
      },
      {
        role: "user",
        parts: [{ text: "Okay, coach, just loading up my database with those awesome workout Reps you created. Give me a sec to get everything organized..." }]
      },
      {
        role: "user",
        parts: [{ text: "Resilience Sample Reps:\n\nRep 1: Resilience (Mindful Breathing)\n\nClose your eyes and take three deep, slow breaths. Focus on the sensations of your breath entering and leaving your body. Once you've done that, rate how easy or difficult it was to keep your attention on your breath. \n\n(Scale: 1-5, with 1 being very easy and 5 being very challenging.) \n\n* _Evaluation: Lower ratings suggest stronger focus and better ability to regulate attention, which is a key component of resilience. _\n\n\nRep 2: Resilience (Cognitive Reframing)\n\nImagine your boss just gave you some harsh criticism on a project. Your initial thought is, \"I'm terrible at my job.\" What's a more balanced and helpful way to reframe that thought?\n\n(Fill-in-the-blank: \"___________________________\")\n\n* _Evaluation:... Look for responses that challenge the negative thought and offer a more realistic or constructive perspective (e.g., \"Everyone makes mistakes. I can learn from this feedback and improve.\")._\n\n\nRep 3: Resilience (Gratitude Burst)\n\nLet's do a Gratitude Burst! Name three things you're grateful for RIGHT NOW. No time to overthink it! \n\n(User provides three things.)\n\n* _Evaluation: This exercise encourages a quick shift in focus to the positive, which can boost resilience. Simply completing the task indicates a willingness to engage in positive reframing._ \n\n\nRep 4: Resilience (Visualizing Success)\n\nPicture yourself calmly handling a stressful situation, like giving a presentation or dealing with a difficult customer. You're confident, prepared, and in control. How does that feel? \n\n(Multiple Choice):\n\nA. Awesome! Bring it on! \nB. Pretty good, I think I could do it. \nC. A little nervous, but manageable.\nD. Super stressed just thinking about it! \n\n* _Evaluation: A indicates a strong ability to visualize and connect with positive emotions, which can enhance resilience._\n\n\nRep 5: Resilience (Reframing a Setback)\n\nImagine you didn't get a job you really wanted. Which thought is closest to how you'd react? \n\n(Multiple Choice):\n\nA. Bummer, but onto the next opportunity!\nB. Maybe it wasn't the right fit anyway. \nC. Guess I need to work on my interview skills. \nD. I'm never going to find a good job. \n\n* _Evaluation: A indicates strong reframing, reflecting a resilient mindset._\n\n\nRep 6: Resilience (Emotional Obstacle Course)\n\nYou're navigating an emotional obstacle course. You just tripped and fell, scraping your knee. Do you:\n\nA. Give up – this course is too hard!\nB. Sit and sulk for a bit, but then keep going. \nC. Brush yourself off and get back in the game!" }]
      },
      // Continue adding the rest of your history here...
    ]
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
