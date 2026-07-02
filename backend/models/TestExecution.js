const mongoose = require('mongoose');

const testExecutionSchema = new mongoose.Schema({
  testCase:  { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase', required: true },
  campaign:  { type: mongoose.Schema.Types.ObjectId, ref: 'TestCampaign' },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['not_run', 'passed', 'failed', 'blocked', 'skipped'],
    default: 'not_run'
  },
  comment:     { type: String },
  screenshots: [{ type: String }],
  duration:    { type: Number },
  executedAt:  { type: Date, default: Date.now },
  stepResults: [{
    stepNumber: { type: Number },
    status:     { type: String, enum: ['passed', 'failed', 'blocked', 'skipped'] },
    comment:    { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TestExecution', testExecutionSchema);
