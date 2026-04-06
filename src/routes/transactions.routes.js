const express = require('express');
const router = express.Router();

const transactionsController = require('../controllers/transactions.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');
const methodNotAllowed = require('../middlewares/method-not-allowed.middleware');

router.use(auth.requireAuth);

// GET /api/v1/transactions
// Supports query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD&accountId=&deptCode=...
router.get(
  '/',
  rbac.requirePermission('TRANSACTION_READ'),
  transactionsController.listTransactions
);

// POST /api/v1/transactions
router.post(
  '/',
  rbac.requirePermission('TRANSACTION_WRITE'),
  transactionsController.createTransaction
);

router.all('/', methodNotAllowed);

// GET /api/v1/transactions/:id
router.get(
  '/:id',
  rbac.requirePermission('TRANSACTION_READ'),
  transactionsController.getTransactionById
);


// PATCH /api/v1/transactions/:id
router.patch(
  '/:id',
  rbac.requirePermission('TRANSACTION_WRITE'),
  transactionsController.updateTransaction
);

router.all('/:id', methodNotAllowed);

// POST /api/v1/transactions/:id/approve
router.post(
  '/:id/approve',
  rbac.requirePermission('TRANSACTION_APPROVE'),
  transactionsController.approveTransaction
);

router.all('/:id/approve', methodNotAllowed);

module.exports = router;