const TestExecution = require('../models/TestExecution');
const Bug = require('../models/Bug');

exports.run = async (req, res) => {
  try {
    const { testCase, campaign, status, comment, stepResults, duration } = req.body;

    const execution = await TestExecution.create({
      testCase,
      campaign,
      executedBy: req.user._id,
      status,
      comment,
      stepResults,
      duration
    });

    if (status === 'failed' && req.body.autoCreateBug) {
      await Bug.create({
        title: `Bug auto — Test ${testCase} échoué`,
        description: comment || 'Échec détecté lors de l\'exécution du test.',
        severity: 'medium',
        priority: 'medium',
        status: 'open',
        testExecution: execution._id,
        testCase,
        createdBy: req.user._id
      });
    }

    await execution.populate('testCase', 'testId title');
    res.status(201).json(execution);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, duration, campaign } = req.body;

    const execution = await TestExecution.findByIdAndUpdate(
      id,
      { status, comment, duration, campaign },
      { new: true }
    )
      .populate('testCase', 'testId title')
      .populate('executedBy', 'firstName lastName')
      .populate('campaign', 'name');

    if (!execution) {
      return res.status(404).json({ message: 'Exécution non trouvée.' });
    }

    res.json(execution);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { campaign, testCase, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (campaign) filter.campaign = campaign;
    if (testCase) filter.testCase = testCase;
    if (status) filter.status = status;

    const total = await TestExecution.countDocuments(filter);
    const results = await TestExecution.find(filter)
      .populate('testCase', 'testId title priority')
      .populate('executedBy', 'firstName lastName')
      .populate('campaign', 'name')
      .sort('-executedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: results, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const exec = await TestExecution.findById(req.params.id)
      .populate('testCase')
      .populate('executedBy', 'firstName lastName')
      .populate('campaign', 'name');
    if (!exec) return res.status(404).json({ message: 'Exécution non trouvée.' });
    res.json(exec);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
