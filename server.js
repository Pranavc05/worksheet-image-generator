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

// Initialize Imagen models
const imagen2Model = 'imagegeneration@002';
const imagen3Model = 'imagegeneration@003';

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagegen', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userImageCountSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  count: { type: Number, default: 0 },
});

const UserImageCount = mongoose.model('UserImageCount', userImageCountSchema);

async function generateImage(prompt, model) {
  try {
    const generativeModel = vertexai.preview.getGenerativeModel({
      model: model,
      generation_config: {
        image_size: {
          width: 50,
          height: 50,
        },
      },
    });

    const stylePrompt = `Create a cartoon style image with a bright white background: ${prompt}`;
    
    const result = await generativeModel.generateImage({
      prompt: stylePrompt,
    });

    return result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 