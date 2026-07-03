const { validationResult } = require('express-validator');
const UserStory = require('../models/UserStory');
const TestCase = require('../models/TestCase');
const Bug = require('../models/Bug');
const axios = require('axios');

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const story = await UserStory.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, priority, sprint, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (sprint) filter.sprint = sprint;
    if (search) filter.$text = { $search: search };

    const total = await UserStory.countDocuments(filter);
    const stories = await UserStory.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const storiesWithCounts = await Promise.all(stories.map(async (story) => {
      const testCount = await TestCase.countDocuments({ userStory: story._id });
      const bugCount = await Bug.countDocuments({ story: story._id });
      return {
        ...story.toObject(),
        testCount,
        bugCount
      };
    }));

    res.json({ data: storiesWithCounts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const story = await UserStory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const story = await UserStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });
    res.json({ message: 'User Story supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getTestCases = async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });

    const tests = await TestCase.find({ userStory: req.params.id })
      .populate('createdBy', 'firstName lastName email')
      .sort('-createdAt');

    res.json({ story, tests, count: tests.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.generateTests = async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    const response = await axios.post(`${AI_SERVICE_URL}/api/generate-tests`, {
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria || []
    });

    const generatedTests = response.data.testCases.map(test => ({
      ...test,
      userStory: req.params.id,
      createdBy: req.user._id,
      generatedByAI: true
    }));

    res.json({ testCases: generatedTests, count: generatedTests.length });
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({ message: 'Erreur lors de la génération des tests.', error: error.message });
  }
};

exports.getBugs = async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });

    const bugs = await Bug.find({ story: req.params.id })
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('testCase', 'title')
      .sort('-createdAt');

    res.json({ story, bugs, count: bugs.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
