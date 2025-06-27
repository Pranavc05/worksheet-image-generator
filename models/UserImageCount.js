const mongoose = require('mongoose');

const userImageCountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  count: { type: Number, default: 0 },
});
userImageCountSchema.index({ userId: 1, month: 1 }, { unique: true });

const UserImageCount = mongoose.model('UserImageCount', userImageCountSchema);

module.exports = UserImageCount; 