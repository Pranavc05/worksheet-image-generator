# Render.com Deployment Guide

## Prerequisites
- GitHub repository with your code
- OpenAI API key
- MongoDB database (local or cloud)

## Step 1: Backend Deployment

### 1.1 Create Backend Service
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `worksheet-generator-backend`
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.2 Environment Variables
Add these environment variables in Render dashboard:
```
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/imagegen
NODE_ENV=production
```

**For MongoDB Atlas (recommended for production):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/imagegen?retryWrites=true&w=majority
```

### 1.3 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-backend-name.onrender.com`

## Step 2: Frontend Deployment

### 2.1 Create Frontend Service
1. In Render dashboard, click "New +" → "Web Service"
2. Connect the same GitHub repository
3. Configure the service:
   - **Name**: `worksheet-generator-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: Free

### 2.2 Environment Variables
Add this environment variable:
```
VITE_API_URL=https://your-backend-name.onrender.com
```
(Replace with your actual backend URL from Step 1.3)

### 2.3 Deploy Frontend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your frontend will be available at: `https://your-frontend-name.onrender.com`

## Step 3: Update CORS Settings

After getting your frontend URL, update the backend CORS settings:

1. Go to your backend service in Render
2. Add environment variable:
```
FRONTEND_URL=https://your-frontend-name.onrender.com
```

3. Update `server.js` CORS configuration:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

## Step 4: Test Your Deployment

1. Visit your frontend URL
2. Try generating a worksheet
3. Test image generation
4. Check that everything works as expected

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check build logs in Render dashboard
2. **CORS Errors**: Verify frontend URL is correct in backend CORS settings
3. **API Errors**: Check environment variables are set correctly
4. **MongoDB Connection**: Ensure MongoDB URI is correct and accessible

### Environment Variables Checklist:
- [ ] `OPENAI_API_KEY` (backend)
- [ ] `MONGODB_URI` (backend)
- [ ] `NODE_ENV=production` (backend)
- [ ] `VITE_API_URL` (frontend)
- [ ] `FRONTEND_URL` (backend, after deployment)

## Cost
- **Free Tier**: 750 hours/month per service
- **Paid Plans**: Start at $7/month if you need more resources

## Next Steps
1. Set up a custom domain (optional)
2. Configure automatic deployments from GitHub
3. Set up monitoring and logging
4. Consider upgrading to paid plan for production use

Your app will be live and shareable with others! 🚀 