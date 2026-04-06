const analyticsService = require('../services/analytics.service');
const {
  validateBudgetVsActualQuery,
  validateDateRangeQuery
} = require('../utils/validation');


async function getCategorySpend(req, res, next) {
  try {
    validateDateRangeQuery(req.query || {});
    const orgId = req.user.organizationId;
    const { from, to } = req.query || {};
    const data = await analyticsService.getCategorySpend(orgId, { from, to });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getBudgetVsActual(req, res, next) {
  try {
    validateBudgetVsActualQuery(req.query || {});
    const orgId = req.user.organizationId;
    const { year } = req.query || {};
    const data = await analyticsService.getBudgetVsActual(orgId, { year });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getCashflow(req, res, next) {
  try {
    validateDateRangeQuery(req.query || {});
    const orgId = req.user.organizationId;
    const { from, to } = req.query || {};
    const data = await analyticsService.getCashflow(orgId, { from, to });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategorySpend,
  getBudgetVsActual,
  getCashflow
};