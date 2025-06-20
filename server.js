require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagegen', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userImageCountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  count: { type: Number, default: 0 },
});
userImageCountSchema.index({ userId: 1, month: 1 }, { unique: true });

const UserImageCount = mongoose.model('UserImageCount', userImageCountSchema);

// Function to generate worksheet questions using OpenAI GPT-4o-mini
async function generateWorksheetQuestions(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert at creating worksheet questions for children.' },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content;
}

// Function to generate an image using OpenAI GPT-Image-1
async function generateImage(prompt) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Generate a clipart-style image for the following: ${prompt}`,
    quality: 'standard',
    size: '1024x1024',
  });
  return response.data[0].url;
}

// Function to generate a master image prompt based on worksheet questions
async function generateMasterImagePrompt(questions) {
  const masterPromptInstruction = `Analyze the following worksheet questions and create a single, detailed DALL-E 3 prompt to generate one image that serves as a visual aid for all questions. The image should be in a simple, friendly cartoon/clipart style, suitable for young children on a worksheet.

Worksheet Questions:
${questions}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a creative director designing a single, helpful illustration for a children\'s worksheet.' },
      { role: 'user', content: masterPromptInstruction },
    ],
  });

  return response.choices[0].message.content;
}

// API endpoint to generate a full worksheet with a relevant image
app.post('/api/generate-worksheet', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Step 1: Generate worksheet questions
    const questions = await generateWorksheetQuestions(prompt);

    // Step 2: Generate a master image prompt from the questions
    const imagePrompt = await generateMasterImagePrompt(questions);

    // Step 3: Generate the actual image
    const imageUrl = await generateImage(imagePrompt);

    // Final response will be here...
    res.json({ success: true, questions, imageUrl }); // Updated temporary response
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to generate images for questions
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;
  // Placeholder userId (replace with real user authentication later)
  const userId = 'test-user';
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  let userCount = await UserImageCount.findOne({ userId, month });
  if (!userCount) {
    userCount = new UserImageCount({ userId, month, count: 0 });
  }
  if (userCount.count >= 100) {
    return res.status(429).json({ success: false, error: 'Image generation limit reached for this month.' });
  }
  try {
    const imageUrl = await generateImage(prompt);
    userCount.count += 1;
    await userCount.save();
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 