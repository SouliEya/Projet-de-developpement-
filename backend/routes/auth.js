const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.post('/register', [
  body('firstName').notEmpty().withMessage('Prénom requis'),
  body('lastName').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères')
], ctrl.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], ctrl.login);

router.get('/profile', auth, ctrl.getProfile);
router.get('/users', auth, authorize('admin'), ctrl.getUsers);
router.put('/users/:id', auth, authorize('admin'), ctrl.updateUser);
router.delete('/users/:id', auth, authorize('admin'), ctrl.deleteUser);

module.exports = router;
