const router = require('express').Router();
const ctrl = require('../controllers/bugController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(auth);

router.post('/', ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('admin', 'qa_engineer'), ctrl.remove);

module.exports = router;
