const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'fixed', 'closed'],
    default: 'open'
  },
  classification: {
    type: String,
    enum: ['functional', 'performance', 'security', 'ux_ui', 'regression', 'unclassified'],
    default: 'unclassified'
  },
  classificationConfidence: { type: Number, min: 0, max: 100, default: 0 },
  screenshots:    [{ type: String }],
  story:          { type: mongoose.Schema.Types.ObjectId, ref: 'UserStory' },
  testCase:       { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
  testExecution:  { type: mongoose.Schema.Types.ObjectId, ref: 'TestExecution' },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

bugSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Bug', bugSchema);
