const db = require('../config/db');
const Transaction = require('../models/transaction.model');

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

function buildFilterWhere(organizationId, filters) {
  const clauses = ['t.organization_id = ?'];
  const params = [organizationId];

  if (filters.from) {
    clauses.push('t.txn_date >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push('t.txn_date <= ?');
    params.push(filters.to);
  }
  if (filters.accountId) {
    clauses.push('t.account_id = ?');
    params.push(filters.accountId);
  }
  if (filters.departmentCode) {
    clauses.push('d.code = ?');
    params.push(filters.departmentCode);
  }
  if (filters.costCenterCode) {
    clauses.push('cc.code = ?');
    params.push(filters.costCenterCode);
  }

  return { where: clauses.join(' AND '), params };
}

async function findByOrganizationWithFilters(organizationId, filters) {
  const { where, params } = buildFilterWhere(organizationId, filters);
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const sql = `
    SELECT
      t.*,
      a.account_number,
      a.name AS account_name,
      d.code AS department_code,
      cc.code AS cost_center_code
    FROM transactions t
    LEFT JOIN accounts a ON a.id = t.account_id
    LEFT JOIN departments d ON d.id = t.department_id
    LEFT JOIN cost_centers cc ON cc.id = t.cost_center_id
    WHERE ${where}
    ORDER BY t.txn_date DESC, t.id DESC
    LIMIT ? OFFSET ?
  `;

  const rows = await all(sql, [...params, limit, offset]);
  return rows.map(Transaction.fromRow);
}

async function findByIdAndOrganization(id, organizationId) {
  const row = await get(
    'SELECT * FROM transactions WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  return Transaction.fromRow(row);
}

async function create(txn) {
  const sql = `
    INSERT INTO transactions
    (organization_id, txn_date, account_id,
     department_id, cost_center_id, description,
     debit_amount, credit_amount, currency,
     status, created_by, approved_by, created_at, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const approvedAt = txn.approvedAt || null;
  const createdAt =
    txn.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' ');

  const res = await run(sql, [
    txn.organizationId,
    txn.txnDate,
    txn.accountId,
    txn.departmentId,
    txn.costCenterId,
    txn.description,
    txn.debitAmount,
    txn.creditAmount,
    txn.currency,
    txn.status,
    txn.createdBy,
    txn.approvedBy || null,
    createdAt,
    approvedAt
  ]);

  return findByIdAndOrganization(res.lastID, txn.organizationId);
}

async function update(id, organizationId, update) {
  const columnMap = {
    txnDate: 'txn_date',
    accountId: 'account_id',
    departmentId: 'department_id',
    costCenterId: 'cost_center_id',
    debitAmount: 'debit_amount',
    creditAmount: 'credit_amount',
    createdBy: 'created_by',
    approvedBy: 'approved_by',
    approvedAt: 'approved_at'
  };

  const keys = Object.keys(update);
  if (keys.length === 0) {
    return findByIdAndOrganization(id, organizationId);
  }

  const sets = [];
  const params = [];
  keys.forEach((k) => {
    const col = columnMap[k] || k;
    sets.push(`${col} = ?`);
    params.push(update[k]);
  });
  params.push(id, organizationId);

  await run(
    `UPDATE transactions SET ${sets.join(', ')}
     WHERE id = ? AND organization_id = ?`,
    params
  );

  return findByIdAndOrganization(id, organizationId);
}

module.exports = {
  findByOrganizationWithFilters,
  findByIdAndOrganization,
  create,
  update
};