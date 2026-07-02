const { validationResult } = require('express-validator');
const UserStory = require('../models/UserStory');

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

    res.json({ data: stories, total, page: Number(page), pages: Math.ceil(total / limit) });
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
