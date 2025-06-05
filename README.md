# Imagen API

This API provides endpoints to interact with Google Cloud's Vertex AI Imagen models for image generation. It supports both Imagen 2 and Imagen 3 Fast models and generates cartoon-style images with specific parameters.

## Prerequisites

1. Node.js and npm installed
2. MongoDB installed and running locally
3. Google Cloud Project with Vertex AI API enabled
4. Google Cloud Service Account with appropriate permissions

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/imagen-api
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Generate Image
- **POST** `/api/generate-image`
- **Body**:
  ```json
  {
    "prompt": "your image description",
    "model": "imagen3" // or "imagen2", defaults to "imagen3"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "imageUrl": "generated-image-url",
      "model": "model-used"
    }
  }
  ```

### Compare Models
- **POST** `/api/compare-models`
- **Body**:
  ```json
  {
    "prompt": "your image description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "imagen2": {
        "imageUrl": "imagen2-generated-url",
        "model": "imagegeneration@002"
      },
      "imagen3": {
        "imageUrl": "imagen3-generated-url",
        "model": "imagegeneration@003"
      }
    }
  }
  ```

## Image Generation Parameters

- Style: Cartoon
- Size: 50x50 pixels
- Background: Bright white

## Error Handling

The API returns appropriate error messages with corresponding HTTP status codes:
- 400: Bad Request (missing parameters)
- 500: Internal Server Error (generation or server issues)

## Notes

- Imagen 3 Fast is generally recommended for faster generation times
- Both models can be compared using the `/api/compare-models` endpoint to determine which works best for your specific use case
- The API automatically adds style parameters to ensure cartoon style and white background 