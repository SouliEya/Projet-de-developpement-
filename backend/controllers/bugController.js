const axios = require('axios');
const Bug = require('../models/Bug');
const TestCase = require('../models/TestCase');
const User = require('../models/User');

exports.create = async (req, res) => {
  try {
    const bugData = { ...req.body, createdBy: req.user._id };

    // Si un test case est lié, récupérer automatiquement la user story
    if (bugData.testCase) {
      const testCase = await TestCase.findById(bugData.testCase).populate('userStory');
      if (testCase && testCase.userStory) {
        bugData.story = testCase.userStory._id;
      }
    }

    // Assigner automatiquement au Product Owner (PO)
    if (!bugData.assignedTo) {
      const productOwner = await User.findOne({ role: 'product_owner', isActive: true });
      if (productOwner) {
        bugData.assignedTo = productOwner._id;
      }
    }

    if (!bugData.classification || bugData.classification === 'unclassified') {
      try {
        const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const aiRes = await axios.post(`${aiUrl}/api/classify-bug`, {
          title: bugData.title,
          description: bugData.description
        }, { timeout: 10000 });
        bugData.classification = aiRes.data.classification;
        bugData.classificationConfidence = aiRes.data.confidence;
      } catch {
        bugData.classification = 'unclassified';
      }
    }

    const bug = await Bug.create(bugData);
    const populatedBug = await Bug.findById(bug._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('testCase', 'title')
      .populate('story', 'title');
    
    res.status(201).json(populatedBug);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, severity, priority, classification, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    if (classification) filter.classification = classification;
    if (search) filter.$text = { $search: search };

    const total = await Bug.countDocuments(filter);
    const bugs = await Bug.find(filter)
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('testCase', 'testId title')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: bugs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('testCase')
      .populate('testExecution');
    if (!bug) return res.status(404).json({ message: 'Bug non trouvé.' });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bug) return res.status(404).json({ message: 'Bug non trouvé.' });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug non trouvé.' });
    res.json({ message: 'Bug supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
