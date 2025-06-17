require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Imagen models
const imagen2Model = 'imagegeneration@002';
const imagen3Model = 'imagegeneration@003';

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

// Model comparison endpoint
app.post('/api/compare-models', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const [imagen2Result, imagen3Result] = await Promise.all([
      generateImage(prompt, imagen2Model),
      generateImage(prompt, imagen3Model)
    ]);

    res.json({
      success: true,
      data: {
        imagen2: {
          imageUrl: imagen2Result.image,
          model: imagen2Model
        },
        imagen3: {
          imageUrl: imagen3Result.image,
          model: imagen3Model
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 