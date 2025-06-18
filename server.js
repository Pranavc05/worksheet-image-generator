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
async function generateImageForQuestion(prompt) {
  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt: `Generate a clipart-style image for the following: ${prompt}`,
    quality: 'low',
    size: '256x256',
  });
  return response.data[0].url;
}

// API endpoint to generate worksheet questions
app.post('/api/generate-questions', async (req, res) => {
  const { prompt } = req.body;
  try {
    const questions = await generateWorksheetQuestions(prompt);
    res.json({ success: true, questions });
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
    const imageUrl = await generateImageForQuestion(prompt);
    userCount.count += 1;
    await userCount.save();
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 