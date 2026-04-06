const transactionsRepository = require('../repositories/transactions.repository');

function parseFilters(query) {
  return {
    from: query.from || null,
    to: query.to || null,
    accountId: query.accountId ? Number(query.accountId) : null,
    departmentCode: query.deptCode || null,
    costCenterCode: query.costCenterCode || null,
    limit: query.limit ? Number(query.limit) : 50,
    offset: query.offset ? Number(query.offset) : 0
  };
}

async function listTransactions(organizationId, query) {
  const filters = parseFilters(query);
  return transactionsRepository.findByOrganizationWithFilters(organizationId, filters);
}

async function getTransactionById(organizationId, id) {
  return transactionsRepository.findByIdAndOrganization(id, organizationId);
}

async function createTransaction(organizationId, userId, payload) {
  const txn = {
    organizationId,
    txnDate: payload.txnDate,
    accountId: payload.accountId,
    departmentId: payload.departmentId || null,
    costCenterId: payload.costCenterId || null,
    description: payload.description || null,
    debitAmount: Number(payload.debitAmount || 0),
    creditAmount: Number(payload.creditAmount || 0),
    currency: payload.currency || 'USD',
    status: 'DRAFT',
    createdBy: userId
  };

  return transactionsRepository.create(txn);
}

async function updateTransaction(organizationId, id, payload) {
  const txn = await transactionsRepository.findByIdAndOrganization(id, organizationId);
  if (!txn) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }
  if (txn.status === 'POSTED') {
    const err = new Error('Posted transactions cannot be edited');
    err.status = 400;
    throw err;
  }

  const update = {};
  [
    'txnDate',
    'accountId',
    'departmentId',
    'costCenterId',
    'description',
    'debitAmount',
    'creditAmount',
    'currency',
    'status'
  ].forEach((field) => {
    if (payload[field] !== undefined) update[field] = payload[field];
  });

  return transactionsRepository.update(id, organizationId, update);
}

async function approveTransaction(organizationId, id, approverUserId) {
  const txn = await transactionsRepository.findByIdAndOrganization(id, organizationId);
  if (!txn) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }
  if (txn.status === 'POSTED') {
    return txn; // already approved/posted
  }

  const update = {
    status: 'POSTED',
    approvedBy: approverUserId,
    approvedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  return transactionsRepository.update(id, organizationId, update);
}

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  approveTransaction
};