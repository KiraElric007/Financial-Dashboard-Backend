const db = require('../config/db');

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// Category spend: by account or department (using accounts.name as category)
async function fetchCategorySpend(organizationId, { from, to }) {
  const clauses = ['t.organization_id = ?', "t.status = 'POSTED'"];
  const params = [organizationId];

  if (from) {
    clauses.push('t.txn_date >= ?');
    params.push(from);
  }
  if (to) {
    clauses.push('t.txn_date <= ?');
    params.push(to);
  }

  const where = clauses.join(' AND ');

  const sql = `
    SELECT
      a.name AS category,
      SUM(t.debit_amount - t.credit_amount) AS spend
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    WHERE ${where}
      AND a.account_type = 'EXPENSE'
    GROUP BY a.name
    ORDER BY spend DESC
  `;

  return all(sql, params);
}

// Budget vs actual per department and quarter
async function fetchBudgetVsActual(organizationId, year) {
  const params = [organizationId];
  let yearClause = '';
  if (year) {
    yearClause = 'AND b.fiscal_year = ?';
    params.push(year);
  }

  const sql = `
    SELECT
      d.code AS department_code,
      b.fiscal_year,
      b.quarter,
      b.budget_amount,
      b.forecast_amount,
      b.actual_amount,
      b.variance_amount
    FROM budgets b
    JOIN departments d ON d.id = b.department_id
    WHERE b.organization_id = ?
      ${yearClause}
    ORDER BY d.code, b.fiscal_year, b.quarter
  `;

  return all(sql, params);
}

// Cashflow: inflow vs outflow per month
async function fetchCashflow(organizationId, { from, to }) {
  const clauses = ['organization_id = ?', "status = 'POSTED'"];
  const params = [organizationId];

  if (from) {
    clauses.push('txn_date >= ?');
    params.push(from);
  }
  if (to) {
    clauses.push('txn_date <= ?');
    params.push(to);
  }

  const where = clauses.join(' AND ');

  const sql = `
    SELECT
      strftime('%Y-%m', txn_date) AS month,
      SUM(credit_amount) AS inflow,
      SUM(debit_amount) AS outflow,
      SUM(credit_amount - debit_amount) AS net
    FROM transactions
    WHERE ${where}
    GROUP BY month
    ORDER BY month ASC
  `;

  return all(sql, params);
}

module.exports = {
  fetchCategorySpend,
  fetchBudgetVsActual,
  fetchCashflow
};