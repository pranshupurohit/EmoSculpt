const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    temperature: 0,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  });

  const result = await model.generateContent([
    "What is in this photo?",
    {
      inlineData: {
        data: Buffer.from(fs.readFileSync('path/to/image.png')).toString("base64"),
        mimeType: 'image/png'
      }
    }
  ]);

  console.log(result.response.text());
}

run();
