async function runChat(userInput) {
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
    history: [], // Keep history empty if you don't want to include previous messages
    systemInstructions: "Your name is Narendra Sharma. You're a therapist. Introduce yourself to the user and ask their name." // Pass system instructions here
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
