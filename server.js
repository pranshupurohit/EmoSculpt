// Import required modules
import fetch from 'node-fetch';
import fs from 'fs';

// Read the system instructions from the JSON file
const systemInstructionsPath = './systeminstructions.json';
let systemInstructions = '';

try {
    const rawData = fs.readFileSync(systemInstructionsPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    systemInstructions = jsonData.systemInstructions || ''; // Adjust the key if necessary
} catch (error) {
    console.error('Error reading or parsing system instructions file:', error);
    process.exit(1); // Exit if there's an issue with the file
}

// Define the function to send the chat request
async function sendChatRequest(userInput) {
    const apiUrl = 'http://localhost:3000/chat'; // URL of your local server

    const requestPayload = {
        systemInstructions, // Include system instructions in the payload
        userInput
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response:', data.response);
    } catch (error) {
        console.error('Error during request:', error);
    }
}

// Example usage
const userInput = 'Hi!'; // Example user input
sendChatRequest(userInput);
