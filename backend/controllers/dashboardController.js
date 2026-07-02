const UserStory = require('../models/UserStory');
const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const Bug = require('../models/Bug');
const TestCampaign = require('../models/TestCampaign');

exports.getStatistics = async (req, res) => {
  try {
    const [
      totalStories,
      storiesByStatus,
      totalTestCases,
      testCasesByPriority,
      aiGeneratedTests,
      totalExecutions,
      executionsByStatus,
      totalBugs,
      bugsByStatus,
      bugsBySeverity,
      bugsByClassification,
      totalCampaigns,
      recentExecutions
    ] = await Promise.all([
      UserStory.countDocuments(),
      UserStory.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      TestCase.countDocuments(),
      TestCase.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      TestCase.countDocuments({ generatedByAI: true }),
      TestExecution.countDocuments(),
      TestExecution.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Bug.countDocuments(),
      Bug.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Bug.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Bug.aggregate([{ $group: { _id: '$classification', count: { $sum: 1 } } }]),
      TestCampaign.countDocuments(),
      TestExecution.aggregate([
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$executedAt' } },
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
        }},
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ])
    ]);

    const execMap = {};
    executionsByStatus.forEach(e => { execMap[e._id] = e.count; });
    const passRate = totalExecutions > 0
      ? Math.round(((execMap.passed || 0) / totalExecutions) * 100)
      : 0;

    res.json({
      stories: { total: totalStories, byStatus: storiesByStatus },
      testCases: { total: totalTestCases, byPriority: testCasesByPriority, aiGenerated: aiGeneratedTests },
      executions: {
        total: totalExecutions,
        byStatus: executionsByStatus,
        passRate,
        passed: execMap.passed || 0,
        failed: execMap.failed || 0,
        blocked: execMap.blocked || 0,
        skipped: execMap.skipped || 0
      },
      bugs: {
        total: totalBugs,
        byStatus: bugsByStatus,
        bySeverity: bugsBySeverity,
        byClassification: bugsByClassification,
        open: bugsByStatus.find(b => b._id === 'open')?.count || 0,
        closed: bugsByStatus.find(b => b._id === 'closed')?.count || 0
      },
      campaigns: { total: totalCampaigns },
      trend: recentExecutions.reverse()
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getKpis = async (req, res) => {
  try {
    const [totalTests, totalExec, passedExec, totalBugs, openBugs, aiTests] = await Promise.all([
      TestCase.countDocuments(),
      TestExecution.countDocuments(),
      TestExecution.countDocuments({ status: 'passed' }),
      Bug.countDocuments(),
      Bug.countDocuments({ status: 'open' }),
      TestCase.countDocuments({ generatedByAI: true })
    ]);

    res.json({
      totalTests,
      executedTests: totalExec,
      passRate: totalExec > 0 ? Math.round((passedExec / totalExec) * 100) : 0,
      totalBugs,
      openBugs,
      aiGeneratedTests: aiTests,
      coverageRate: totalTests > 0 ? Math.round((totalExec / totalTests) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
