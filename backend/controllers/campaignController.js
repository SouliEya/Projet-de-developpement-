const TestCampaign = require('../models/TestCampaign');

exports.create = async (req, res) => {
  try {
    const campaign = await TestCampaign.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, sprint } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (sprint) filter.sprint = sprint;

    const campaigns = await TestCampaign.find(filter)
      .populate('testCases', 'testId title priority')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const campaign = await TestCampaign.findById(req.params.id)
      .populate('testCases')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');
    if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée.' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const campaign = await TestCampaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée.' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const campaign = await TestCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campagne non trouvée.' });
    res.json({ message: 'Campagne supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
