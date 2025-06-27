const { OpenAI } = require('openai');
const UserImageCount = require('../models/UserImageCount');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate worksheet questions
async function generateWorksheetQuestions(prompt) {
  // Instruct the AI to return ONLY a JSON array of objects with a 'question' field, no explanation or extra text
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: 'system', content: 'You are a JSON generator that creates worksheet questions. You must respond with a JSON object containing an array of questions.' },
      { role: 'user', content: `${prompt}\n\nReturn a JSON object with this exact structure:\n{"questions": [{"question": "What is 2 + 3?"}, {"question": "How many sides does a triangle have?"}]}\n\nEach question object must have exactly one field called "question".` },
    ],
  });
  return response.choices[0].message.content;
}

// Generate an image for a question
async function generateImage(prompt) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Create a simple, clear image for each question presented that helps answer this question: ${prompt}`,
    quality: 'standard',
    size: '1024x1024',
  });
  return response.data[0].url;
}

module.exports = {
  generateWorksheetQuestions,
  generateImage,
}; 