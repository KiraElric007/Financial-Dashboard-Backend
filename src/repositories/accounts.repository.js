const db = require('../config/db');
const Account = require('../models/account.model');

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function findAllByOrganization(organizationId) {
  const rows = await all(
    `SELECT * FROM accounts
     WHERE organization_id = ?
     ORDER BY account_number`,
    [organizationId]
  );
  return rows.map(Account.fromRow);
}

async function findByIdAndOrganization(id, organizationId) {
  const row = await get(
    'SELECT * FROM accounts WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  return Account.fromRow(row);
}

async function findByNumber(organizationId, accountNumber) {
  const row = await get(
    'SELECT * FROM accounts WHERE organization_id = ? AND account_number = ?',
    [organizationId, accountNumber]
  );
  return Account.fromRow(row);
}

async function create({ organizationId, accountNumber, name, accountType, currency }) {
  const res = await run(
    `INSERT INTO accounts
     (organization_id, account_number, name, account_type, currency)
     VALUES (?, ?, ?, ?, ?)`,
    [organizationId, accountNumber, name, accountType, currency]
  );
  return findByIdAndOrganization(res.lastID, organizationId);
}

async function update(id, organizationId, update) {
  const columnMap = {
    accountType: 'account_type'
  };

  const keys = Object.keys(update);
  if (keys.length === 0) return findByIdAndOrganization(id, organizationId);

  const sets = [];
  const params = [];
  keys.forEach((k) => {
    const col = columnMap[k] || k;
    sets.push(`${col} = ?`);
    params.push(update[k]);
  });
  params.push(id, organizationId);

  await run(
    `UPDATE accounts SET ${sets.join(', ')}
     WHERE id = ? AND organization_id = ?`,
    params
  );
  return findByIdAndOrganization(id, organizationId);
}

async function remove(id, organizationId) {
  await run('DELETE FROM accounts WHERE id = ? AND organization_id = ?', [
    id,
    organizationId
  ]);
}

module.exports = {
  findAllByOrganization,
  findByIdAndOrganization,
  findByNumber,
  create,
  update,
  remove
};