const transactionsService = require('../services/transactions.service');
const {
  validateTransactionCreateBody,
  validateTransactionUpdateBody
} = require('../utils/validation');

async function listTransactions(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const txns = await transactionsService.listTransactions(orgId, req.query || {});
    res.json(txns);
  } catch (err) {
    next(err);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    const txn = await transactionsService.getTransactionById(orgId, Number(id));
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json(txn);
  } catch (err) {
    next(err);
  }
}

async function createTransaction(req, res, next) {
  try {
    validateTransactionCreateBody(req.body);
    const orgId = req.user.organizationId;
    const userId = req.user.id;
    const created = await transactionsService.createTransaction(orgId, userId, req.body || {});
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateTransaction(req, res, next) {
  try {
    validateTransactionUpdateBody(req.body);
    const orgId = req.user.organizationId;
    const { id } = req.params;
    const updated = await transactionsService.updateTransaction(orgId, Number(id), req.body || {});
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function approveTransaction(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await transactionsService.approveTransaction(orgId, Number(id), userId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  approveTransaction
};