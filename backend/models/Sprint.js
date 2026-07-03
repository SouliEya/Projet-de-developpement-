const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  goal: { 
    type: String,
    trim: true
  },
  startDate: { 
    type: Date,
    required: true
  },
  endDate: { 
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserStory'
  }],
  velocity: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  completedPoints: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

sprintSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model('Sprint', sprintSchema);
