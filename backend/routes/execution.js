const router = require('express').Router();
const ctrl = require('../controllers/executionController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/run', ctrl.run);
router.get('/results', ctrl.getResults);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);

module.exports = router;
