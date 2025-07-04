const { OpenAI } = require('openai');
const UserImageCount = require('../models/UserImageCount');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Parse AI response and convert to JSON array format
function parseQuestionsResponse(response) {
  console.log('Raw AI response:', response);
  
  try {
    // First try to parse as JSON
    const parsed = JSON.parse(response);
    console.log('Parsed as JSON:', parsed);
    if (parsed.questions && Array.isArray(parsed.questions)) {
      // Always return exactly 3 questions as strings
      return parsed.questions.slice(0, 3).map(q => typeof q === 'string' ? q : q.question);
    }
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3).map(q => typeof q === 'string' ? q : q.question);
    }
  } catch (e) {
    console.log('JSON parsing failed, trying text parsing...');
    // If JSON parsing fails, extract questions from text
    const lines = response.split('\n');
    const questions = [];
    
    for (const line of lines) {
      console.log('Processing line:', line);
      // Look for lines that contain question content and end with ?
      if (line.includes('?') && line.trim().length > 0 && !line.includes('Sure!')) {
        // Clean up the line and extract the question
        let question = line
          .replace(/^\d+\.\s*/, '') // Remove numbering
          .replace(/\*\*/g, '') // Remove markdown
          .replace(/\(Answer:.*?\)/g, '') // Remove answer parts
          .replace(/\*\*Answer\*\*:.*$/, '') // Remove answer parts with markdown
          .trim();
        
        console.log('Extracted question:', question);
        if (question && question.length > 10 && question.includes('?')) {
          questions.push(question);
        }
      }
    }
    
    console.log('Extracted questions:', questions);
    // If we found questions, return them
    if (questions.length > 0) {
      return questions.slice(0, 3);
    }
  }
  
  // Fallback: return the response as a single question
  console.log('Using fallback - returning response as single question');
  return [response];
}

// Generate worksheet questions
async function generateWorksheetQuestions(prompt) {
  // Instruct the AI to return ONLY a JSON array of objects with a 'question' field, no explanation or extra text
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: 'system', content: 'You are a JSON generator that creates educational worksheet questions. You must respond with a JSON object containing an array of exactly 3 questions, each as a string. Questions should be clear, age-appropriate, and suitable for special education students.' },
      { role: 'user', content: `${prompt}\n\nGenerate exactly 3 educational questions. Return a JSON object with this exact structure:\n{"questions": ["What is 2 + 3?", "How many sides does a triangle have?", "What is the capital of France?"]}` },
    ],
  });
  
  const rawResponse = response.choices[0].message.content;
  const questions = parseQuestionsResponse(rawResponse);
  console.log('Final questions returned:', questions);
  return questions;
}

// Generate an image for a question
async function generateImage(prompt) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Create a simple, clear educational image with a pure white background that helps answer this question: ${prompt}. The image should be clean, professional, and suitable for educational worksheets. No text, symbols, or special characters should be included in the image.`,
    quality: 'standard',
    size: '1024x1024',
  });
  return response.data[0].url;
}

module.exports = {
  generateWorksheetQuestions,
  generateImage,
}; 