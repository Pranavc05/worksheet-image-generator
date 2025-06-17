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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 