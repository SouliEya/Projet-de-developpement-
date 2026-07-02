const router = require('express').Router();
const ctrl = require('../controllers/testcaseController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(auth);

router.post('/generate', authorize('admin', 'qa_engineer'), ctrl.generate);
router.post('/', authorize('admin', 'qa_engineer'), ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', authorize('admin', 'qa_engineer'), ctrl.update);
router.delete('/:id', authorize('admin', 'qa_engineer'), ctrl.remove);

module.exports = router;
