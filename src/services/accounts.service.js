const accountsRepository = require('../repositories/accounts.repository');

async function listAccounts(organizationId) {
  return accountsRepository.findAllByOrganization(organizationId);
}

async function getAccountById(organizationId, id) {
  return accountsRepository.findByIdAndOrganization(id, organizationId);
}

async function createAccount(organizationId, payload) {
  const { accountNumber, name, accountType, currency } = payload;
  const existing = await accountsRepository.findByNumber(organizationId, accountNumber);
  if (existing) {
    const err = new Error('Account with this number already exists');
    err.status = 409;
    throw err;
  }

  return accountsRepository.create({
    organizationId,
    accountNumber,
    name,
    accountType,
    currency
  });
}

async function updateAccount(organizationId, id, payload) {
  const account = await accountsRepository.findByIdAndOrganization(id, organizationId);
  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }

  const update = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.accountType !== undefined) update.accountType = payload.accountType;
  if (payload.currency !== undefined) update.currency = payload.currency;

  return accountsRepository.update(id, organizationId, update);
}

async function deleteAccount(organizationId, id) {
  const account = await accountsRepository.findByIdAndOrganization(id, organizationId);
  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }
  await accountsRepository.remove(id, organizationId);
}

module.exports = {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};