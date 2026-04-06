const db = require('../config/db');
const Budget = require('../models/budget.model');

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

async function findByOrganizationAndYear(organizationId, fiscalYear) {
  const rows = await all(
    `SELECT * FROM budgets
     WHERE organization_id = ? AND fiscal_year = ?
     ORDER BY department_id, quarter`,
    [organizationId, fiscalYear]
  );
  return rows.map(Budget.fromRow);
}

async function upsertBudget(budget) { // Insert or update
  await run(
    `INSERT OR REPLACE INTO budgets
     (id, organization_id, department_id, fiscal_year, quarter,
      budget_amount, forecast_amount, actual_amount, variance_amount,
      currency, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      budget.id || null,
      budget.organizationId,
      budget.departmentId,
      budget.fiscalYear,
      budget.quarter,
      budget.budgetAmount,
      budget.forecastAmount,
      budget.actualAmount,
      budget.varianceAmount,
      budget.currency,
      budget.notes
    ]
  );
}

module.exports = {
  findByOrganizationAndYear,
  upsertBudget
};