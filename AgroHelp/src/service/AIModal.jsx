import {GoogleGenerativeAI} from "@google/generative-ai";

const apiKey = "Add Your Gemini Key here";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
  ],
});




// import { GoogleGenerativeAI } from "@google/generative-ai";

// const apiKey = "";
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// });

// // Configurations for the generative AI model
// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
//   responseMimeType: "application/json",
// };

// // Start chat session for agricultural AI use case
// export const agroAIChatSession = model.startChat({
//   generationConfig,
//    history: [
//   //   { role: 'user', content: 'Hello, how are you?' },
//     // Other messages

//     // { role: "system", content: "You are an agricultural assistant. Provide expert crop and fertilizer recommendations based on the user's input." },
//   ],
// });

