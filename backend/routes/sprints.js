const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/sprintController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(auth);

router.post('/', authorize('admin', 'qa_engineer', 'test_manager'), [
  body('name').notEmpty().withMessage('Nom requis'),
  body('startDate').notEmpty().withMessage('Date de début requise'),
  body('endDate').notEmpty().withMessage('Date de fin requise')
], ctrl.create);

router.get('/', ctrl.getAll);
router.get('/active', ctrl.getActiveSprint);
router.get('/:id', ctrl.getById);
router.put('/:id', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.update);
router.delete('/:id', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.remove);

router.post('/:id/stories', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.addStory);
router.delete('/:id/stories/:storyId', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.removeStory);

router.post('/:id/start', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.startSprint);
router.post('/:id/complete', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.completeSprint);

module.exports = router;
