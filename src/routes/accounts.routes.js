const express = require('express');
const router = express.Router();

const accountsController = require('../controllers/accounts.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');
const methodNotAllowed = require('../middlewares/method-not-allowed.middleware');

router.use(auth.requireAuth);

// GET /api/v1/accounts
router.get(
  '/',
  rbac.requirePermission('TRANSACTION_READ'),
  accountsController.listAccounts
);

// POST /api/v1/accounts
router.post(
  '/',
  rbac.requirePermission('TRANSACTION_WRITE'),
  accountsController.createAccount
);

router.all('/', methodNotAllowed);

// GET /api/v1/accounts/:id
router.get(
  '/:id',
  rbac.requirePermission('TRANSACTION_READ'),
  accountsController.getAccountById
);


// PATCH /api/v1/accounts/:id
router.patch(
  '/:id',
  rbac.requirePermission('TRANSACTION_WRITE'),
  accountsController.updateAccount
);

// DELETE /api/v1/accounts/:id
router.delete(
  '/:id',
  rbac.requirePermission('TRANSACTION_WRITE'),
  accountsController.deleteAccount
);

router.all('/:id', methodNotAllowed);

module.exports = router;