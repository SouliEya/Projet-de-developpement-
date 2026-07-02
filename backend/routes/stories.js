const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/storyController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(auth);

router.post('/', authorize('admin', 'qa_engineer'), [
  body('title').notEmpty().withMessage('Titre requis'),
  body('description').notEmpty().withMessage('Description requise')
], ctrl.create);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', authorize('admin', 'qa_engineer'), ctrl.update);
router.delete('/:id', authorize('admin', 'qa_engineer'), ctrl.remove);

module.exports = router;
