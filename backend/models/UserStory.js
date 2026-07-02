const mongoose = require('mongoose');

const userStorySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  acceptanceCriteria: [{ type: String }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  sprint:  { type: String, trim: true },
  status: {
    type: String,
    enum: ['draft', 'ready', 'in_progress', 'done'],
    default: 'draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project:   { type: String, trim: true }
}, { timestamps: true });

userStorySchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('UserStory', userStorySchema);
