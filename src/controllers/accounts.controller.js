const accountsService = require('../services/accounts.service');
const { validateAccountCreateBody } = require('../utils/validation');

async function listAccounts(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const accounts = await accountsService.listAccounts(orgId);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
}

async function getAccountById(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    const account = await accountsService.getAccountById(orgId, Number(id));
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    next(err);
  }
}

async function createAccount(req, res, next) {
  try {
    validateAccountCreateBody(req.body);
    const orgId = req.user.organizationId;
    const created = await accountsService.createAccount(orgId, req.body || {});
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateAccount(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    const updated = await accountsService.updateAccount(orgId, Number(id), req.body || {});
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    await accountsService.deleteAccount(orgId, Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};