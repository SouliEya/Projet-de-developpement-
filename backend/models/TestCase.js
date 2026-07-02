const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  testId:    { type: String, required: true, unique: true },
  title:     { type: String, required: true },
  description: { type: String },
  preconditions: [{ type: String }],
  steps: [{
    stepNumber:     { type: Number, required: true },
    action:         { type: String, required: true },
    expectedResult: { type: String, required: true },
    testData:       { type: String }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['functional', 'performance', 'security', 'ux_ui', 'regression'],
    default: 'functional'
  },
  isAutomated:  { type: Boolean, default: false },
  automationScore: { type: Number, min: 0, max: 100, default: 0 },
  userStory:    { type: mongoose.Schema.Types.ObjectId, ref: 'UserStory' },
  generatedByAI: { type: Boolean, default: false },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

testCaseSchema.index({ testId: 1 });

module.exports = mongoose.model('TestCase', testCaseSchema);
