const analyticsRepository = require('../repositories/analytics.repository');

async function getCategorySpend(organizationId, { from, to }) {
  return analyticsRepository.fetchCategorySpend(organizationId, { from, to });
}

async function getBudgetVsActual(organizationId, { year }) {
  const y = year ? Number(year) : null;
  return analyticsRepository.fetchBudgetVsActual(organizationId, y);
}

async function getCashflow(organizationId, { from, to }) {
  return analyticsRepository.fetchCashflow(organizationId, { from, to });
}

module.exports = {
  getCategorySpend,
  getBudgetVsActual,
  getCashflow
};