require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Vertex AI
const vertexai = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: 'us-central1',
});

// Initialize Imagen models
const imagen2Model = 'imagegeneration@002';
const imagen3Model = 'imagegeneration@003';

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

// API Routes
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, model = 'imagen3' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const selectedModel = model === 'imagen3' ? imagen3Model : imagen2Model;
    const result = await generateImage(prompt, selectedModel);

    res.json({
      success: true,
      data: {
        imageUrl: result.image,
        model: selectedModel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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