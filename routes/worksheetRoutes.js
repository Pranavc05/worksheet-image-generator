const express = require('express');
const router = express.Router();
const worksheetController = require('../controllers/worksheetController');
const UserImageCount = require('../models/UserImageCount');

// POST /api/generate-worksheet
router.post('/generate-worksheet', async (req, res) => {
  try {
    const { prompt } = req.body;
    const questions = await worksheetController.generateWorksheetQuestions(prompt);
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/generate-image
router.post('/generate-image', async (req, res) => {
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
    const imageUrl = await worksheetController.generateImage(prompt);
    userCount.count += 1;
    await userCount.save();
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 