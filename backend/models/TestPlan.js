const mongoose = require('mongoose');

const testPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sprint: { type: String },
  status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TestPlan', testPlanSchema);
