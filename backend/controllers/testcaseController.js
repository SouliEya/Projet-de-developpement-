const axios = require('axios');
const TestCase = require('../models/TestCase');
const UserStory = require('../models/UserStory');

let testIdCounter = 0;

const getNextTestId = async () => {
  const last = await TestCase.findOne().sort('-createdAt');
  if (last && last.testId) {
    const num = parseInt(last.testId.replace('TC', ''), 10);
    testIdCounter = isNaN(num) ? testIdCounter : num;
  }
  testIdCounter++;
  return `TC${String(testIdCounter).padStart(3, '0')}`;
};

exports.generate = async (req, res) => {
  try {
    const { userStoryId } = req.body;
    const story = await UserStory.findById(userStoryId);
    if (!story) return res.status(404).json({ message: 'User Story non trouvée.' });

    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let generated;
    try {
      const response = await axios.post(`${aiUrl}/api/generate-tests`, {
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria
      }, { timeout: 30000 });
      generated = response.data.testCases;
    } catch {
      generated = generateFallbackTests(story);
    }

    const testCases = [];
    for (const tc of generated) {
      const testId = await getNextTestId();
      const testCase = await TestCase.create({
        testId,
        title: tc.title,
        description: tc.description || '',
        preconditions: tc.preconditions || [],
        steps: tc.steps || [],
        priority: tc.priority || 'medium',
        type: tc.type || 'functional',
        userStory: story._id,
        generatedByAI: true,
        createdBy: req.user._id
      });
      testCases.push(testCase);
    }

    res.status(201).json({ count: testCases.length, testCases });
  } catch (error) {
    res.status(500).json({ message: 'Erreur génération.', error: error.message });
  }
};

function generateFallbackTests(story) {
  const tests = [];
  tests.push({
    title: `${story.title} — Cas nominal`,
    description: `Vérifier le scénario positif pour: ${story.title}`,
    preconditions: ['Utilisateur connecté', 'Données de test préparées'],
    steps: [
      { stepNumber: 1, action: 'Accéder à la fonctionnalité', expectedResult: 'Page affichée correctement' },
      { stepNumber: 2, action: 'Saisir les données valides', expectedResult: 'Données acceptées' },
      { stepNumber: 3, action: 'Valider l\'action', expectedResult: 'Résultat attendu obtenu' }
    ],
    priority: 'high',
    type: 'functional'
  });
  tests.push({
    title: `${story.title} — Données invalides`,
    description: `Vérifier le comportement avec des données invalides`,
    preconditions: ['Utilisateur connecté'],
    steps: [
      { stepNumber: 1, action: 'Accéder à la fonctionnalité', expectedResult: 'Page affichée' },
      { stepNumber: 2, action: 'Saisir des données invalides', expectedResult: 'Message d\'erreur affiché' }
    ],
    priority: 'high',
    type: 'functional'
  });
  tests.push({
    title: `${story.title} — Champs vides`,
    description: `Vérifier la validation des champs obligatoires`,
    preconditions: ['Utilisateur connecté'],
    steps: [
      { stepNumber: 1, action: 'Accéder à la fonctionnalité', expectedResult: 'Page affichée' },
      { stepNumber: 2, action: 'Soumettre sans remplir les champs', expectedResult: 'Messages de validation affichés' }
    ],
    priority: 'medium',
    type: 'functional'
  });
  if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
    story.acceptanceCriteria.forEach((criteria, idx) => {
      tests.push({
        title: `${story.title} — Critère: ${criteria.substring(0, 50)}`,
        description: `Valider le critère d'acceptation: ${criteria}`,
        preconditions: ['Utilisateur connecté'],
        steps: [
          { stepNumber: 1, action: 'Mettre en place les conditions', expectedResult: 'Environnement prêt' },
          { stepNumber: 2, action: `Vérifier: ${criteria}`, expectedResult: 'Critère satisfait' }
        ],
        priority: 'medium',
        type: 'functional'
      });
    });
  }
  return tests;
}

exports.create = async (req, res) => {
  try {
    const { title, description, preconditions, steps, priority, type, userStory } = req.body;
    if (!title) return res.status(400).json({ message: 'Le titre est obligatoire.' });

    const testId = await getNextTestId();
    const testCase = await TestCase.create({
      testId, title, description, preconditions, steps,
      priority: priority || 'medium',
      type: type || 'functional',
      userStory: userStory || undefined,
      generatedByAI: false,
      createdBy: req.user._id
    });

    const populated = await TestCase.findById(testCase._id)
      .populate('userStory', 'title')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { userStory, priority, type, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (userStory) filter.userStory = userStory;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    const total = await TestCase.countDocuments(filter);
    const testCases = await TestCase.find(filter)
      .populate('userStory', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort('testId')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: testCases, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const tc = await TestCase.findById(req.params.id)
      .populate('userStory', 'title description')
      .populate('createdBy', 'firstName lastName');
    if (!tc) return res.status(404).json({ message: 'Cas de test non trouvé.' });
    res.json(tc);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const tc = await TestCase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('userStory', 'title')
      .populate('createdBy', 'firstName lastName');
    if (!tc) return res.status(404).json({ message: 'Cas de test non trouvé.' });
    res.json(tc);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const tc = await TestCase.findByIdAndDelete(req.params.id);
    if (!tc) return res.status(404).json({ message: 'Cas de test non trouvé.' });
    res.json({ message: 'Cas de test supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
