const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const methodNotAllowed = require('../middlewares/method-not-allowed.middleware');

// POST /auth/login
router.post('/login', authController.login);
router.all('/login', methodNotAllowed);

// POST /auth/logout
router.post('/logout', authController.logout);
router.all('/logout', methodNotAllowed);

// GET /auth/me
router.get('/me', auth.requireAuth, authController.getCurrentUser);
router.all('/me', methodNotAllowed);

module.exports = router;