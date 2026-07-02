const mongoose = require('mongoose');

const testCampaignSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  sprint:      { type: String },
  startDate:   { type: Date },
  endDate:     { type: Date },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  testCases:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TestCampaign', testCampaignSchema);
