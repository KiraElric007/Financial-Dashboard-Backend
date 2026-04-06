const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');
const methodNotAllowed = require('../middlewares/method-not-allowed.middleware');

// All user routes require authentication
router.use(auth.requireAuth);

// GET /api/v1/users  (admin only)
router.get(
  '/',
  rbac.requirePermission('USER_MANAGE'),
  usersController.listUsers
);

// POST /api/v1/users
router.post(
  '/',
  rbac.requirePermission('USER_MANAGE'),
  usersController.createUser
);

router.all('/', methodNotAllowed);

// GET /api/v1/users/:id
router.get(
  '/:id',
  rbac.requirePermission('USER_MANAGE'),
  usersController.getUserById
);

// PATCH /api/v1/users/:id
router.patch(
  '/:id',
  rbac.requirePermission('USER_MANAGE'),
  usersController.updateUser
);

// DELETE /api/v1/users/:id
router.delete(
  '/:id',
  rbac.requirePermission('USER_MANAGE'),
  usersController.deleteUser
);

router.all('/:id', methodNotAllowed);

module.exports = router;
