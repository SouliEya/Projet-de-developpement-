const TestPlan = require('../models/TestPlan');

exports.create = async (req, res) => {
  try {
    const { name, description, sprint, status, testCases } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom est obligatoire.' });

    const plan = await TestPlan.create({
      name, description, sprint, status,
      testCases: testCases || [],
      createdBy: req.user._id,
    });

    const populated = await TestPlan.findById(plan._id)
      .populate('createdBy', 'firstName lastName')
      .populate({ path: 'testCases', populate: { path: 'userStory', select: 'title priority' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const plans = await TestPlan.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'testCases',
        populate: [
          { path: 'userStory', select: 'title priority status' },
          { path: 'createdBy', select: 'firstName lastName' },
        ],
      })
      .sort('-createdAt');

    res.json({ data: plans, total: plans.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const plan = await TestPlan.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'testCases',
        populate: [
          { path: 'userStory', select: 'title priority status' },
          { path: 'createdBy', select: 'firstName lastName' },
        ],
      });
    if (!plan) return res.status(404).json({ message: 'Plan de test non trouvé.' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await TestPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'testCases',
        populate: [
          { path: 'userStory', select: 'title priority status' },
          { path: 'createdBy', select: 'firstName lastName' },
        ],
      });
    if (!plan) return res.status(404).json({ message: 'Plan de test non trouvé.' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const plan = await TestPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan de test non trouvé.' });
    res.json({ message: 'Plan de test supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
