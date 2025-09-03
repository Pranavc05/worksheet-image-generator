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
async function generateImage(questionText) {
  // Create a more specific prompt based on question content
  let imagePrompt = '';
  
  // Analyze the question to determine what kind of helpful image to generate
  const question = questionText.toLowerCase();
  
  if (question.includes('fraction') || question.includes('1/2') || question.includes('1/4') || question.includes('0.25') || question.includes('0.5')) {
    imagePrompt = `Create a simple educational diagram showing fractions visually. Show circles or rectangles divided into equal parts with some parts shaded to represent fractions. Use bright colors on white background. Make it clear and easy for students to understand fractions.`;
  } else if (question.includes('loop') || question.includes('for') || question.includes('i++') || question.includes('iteration')) {
    imagePrompt = `Create a simple flowchart diagram showing how a for loop works step by step. Show boxes connected by arrows indicating: START → Check condition → Execute code → Increment counter → Check condition again → END. Use simple shapes and clear arrows on white background.`;
  } else if (question.includes('triangle') || question.includes('square') || question.includes('circle') || question.includes('shape')) {
    imagePrompt = `Create simple, clear geometric shapes: a triangle, square, and circle. Each shape should be a different bright color, clearly labeled, and arranged neatly on a white background for easy identification.`;
  } else if (question.includes('add') || question.includes('+') || question.includes('plus') || question.includes('sum')) {
    imagePrompt = `Create a visual addition problem using simple objects like apples, dots, or blocks. Show groups of objects that can be counted and added together. Use bright colors on white background.`;
  } else if (question.includes('count') || question.includes('how many') || question.includes('number')) {
    imagePrompt = `Create a simple counting visual with clearly countable objects like dots, stars, or simple shapes arranged in an organized way. Use bright colors on white background for easy counting.`;
  } else if (question.includes('time') || question.includes('clock') || question.includes("o'clock")) {
    imagePrompt = `Create a simple, clear analog clock face showing a specific time. The clock should have large, easy-to-read numbers and clear hour and minute hands on white background.`;
  } else if (question.includes('money') || question.includes('cent') || question.includes('dollar') || question.includes('coin')) {
    imagePrompt = `Create simple, clear images of coins and dollar bills. Show pennies, nickels, dimes, quarters clearly labeled with their values on white background.`;
  } else {
    // Generic educational visual
    imagePrompt = `Create a simple, clear educational illustration that helps students understand the concept in this question: "${questionText}". Use bright colors, simple shapes, and make it very clear and easy to understand on white background. Focus on creating a helpful visual aid.`;
  }
  
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: imagePrompt,
    quality: 'standard',
    size: '1024x1024',
  });
  return response.data[0].url;
}

module.exports = {
  generateWorksheetQuestions,
  generateImage,
}; 