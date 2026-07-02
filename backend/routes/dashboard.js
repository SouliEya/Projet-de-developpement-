const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/statistics', ctrl.getStatistics);
router.get('/kpis', ctrl.getKpis);

module.exports = router;
