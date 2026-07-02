const router = require('express').Router();
const ctrl = require('../controllers/campaignController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(auth);

router.post('/', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', authorize('admin', 'qa_engineer', 'test_manager'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
