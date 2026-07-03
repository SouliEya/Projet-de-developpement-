const { validationResult } = require('express-validator');
const Sprint = require('../models/Sprint');
const UserStory = require('../models/UserStory');
const TestCase = require('../models/TestCase');
const Bug = require('../models/Bug');

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const sprint = await Sprint.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Sprint.countDocuments(filter);
    const sprints = await Sprint.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate({
        path: 'stories',
        select: 'title status priority',
        populate: { path: 'createdBy', select: 'firstName lastName' }
      })
      .sort('-startDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: sprints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate({
        path: 'stories',
        populate: { path: 'createdBy', select: 'firstName lastName' }
      });

    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });

    const storyIds = sprint.stories.map(s => s._id);
    const tests = await TestCase.find({ userStory: { $in: storyIds } });
    const bugs = await Bug.find({ story: { $in: storyIds }, status: { $in: ['open', 'assigned', 'in_progress'] } });

    const metrics = {
      totalStories: sprint.stories.length,
      completedStories: sprint.stories.filter(s => s.status === 'done').length,
      totalPoints: sprint.totalPoints || 0,
      completedPoints: sprint.completedPoints || 0,
      totalTests: tests.length,
      openBugs: bugs.length
    };

    res.json({ ...sprint.toObject(), metrics });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });
    res.json({ message: 'Sprint supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.addStory = async (req, res) => {
  try {
    const { storyId } = req.body;
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });

    if (!sprint.stories.includes(storyId)) {
      sprint.stories.push(storyId);
      await sprint.save();
      
      await UserStory.findByIdAndUpdate(storyId, { sprint: sprint.name });
    }

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.removeStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });

    sprint.stories = sprint.stories.filter(s => s.toString() !== storyId);
    await sprint.save();
    
    await UserStory.findByIdAndUpdate(storyId, { $unset: { sprint: 1 } });

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.startSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });
    
    if (sprint.status !== 'planned') {
      return res.status(400).json({ message: 'Seul un sprint planifié peut être démarré.' });
    }

    await Sprint.updateMany({ status: 'active' }, { status: 'completed' });

    sprint.status = 'active';
    sprint.startDate = new Date();
    await sprint.save();

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint non trouvé.' });

    sprint.status = 'completed';
    sprint.endDate = new Date();
    await sprint.save();

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getActiveSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOne({ status: 'active' })
      .populate('createdBy', 'firstName lastName email')
      .populate({
        path: 'stories',
        populate: { path: 'createdBy', select: 'firstName lastName' }
      });

    if (!sprint) return res.status(404).json({ message: 'Aucun sprint actif.' });

    const storyIds = sprint.stories.map(s => s._id);
    const tests = await TestCase.find({ userStory: { $in: storyIds } });
    const bugs = await Bug.find({ story: { $in: storyIds }, status: { $in: ['open', 'assigned', 'in_progress'] } });

    const metrics = {
      totalStories: sprint.stories.length,
      completedStories: sprint.stories.filter(s => s.status === 'done').length,
      totalPoints: sprint.totalPoints || 0,
      completedPoints: sprint.completedPoints || 0,
      totalTests: tests.length,
      openBugs: bugs.length
    };

    res.json({ ...sprint.toObject(), metrics });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
