require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagegen', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
const worksheetRoutes = require('./routes/worksheetRoutes');
app.use('/api', worksheetRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 